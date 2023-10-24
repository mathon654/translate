const fs = require('fs');
const csv = require('csv-parser');
const path = require("path");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const EXCLUDED_COLUMNS = ['id', 'version', 'comment'];
const CSV_DIR = '../splitCsv_json/src';
const OUTPUT_DIR = '../splitCsv_json/output';

let csvFiles = fs.readdirSync(CSV_DIR).filter(file => path.extname(file) === '.csv');

csvFiles.forEach(CSV_FILE => {
  let usedIds = [];
  let totalRows = 0;
  let validRows = 0;
  let translations = {};

  let baseName = path.basename(CSV_FILE, '.csv'); // This gets the filename without the extension

  fs.createReadStream(path.join(CSV_DIR, CSV_FILE))
    .pipe(csv())
    .on('data', row => {
      totalRows++;

      const id = row['id'];

      if (!id) {
        throw new Error(`The id of row ${totalRows} is empty!`);
      }

      if (usedIds.includes(id)) {
        throw new Error(`The id "${id}" in row ${totalRows} is duplicated!`);
      }

      for (let lang in row) {
        if (!EXCLUDED_COLUMNS.includes(lang) && row[lang]) {
          if (!translations[lang]) {
            translations[lang] = {};
          }
          translations[lang][id] = row[lang];
        }
      }

      usedIds.push(id);
      validRows++;
    }).on('end', () => {
    for (let lang in translations) {
      const data = [];
      for (let id in translations[lang]) {
        const row = {
          id: id,
          zh: translations['zh'] ? translations['zh'][id] : '',
          [lang]: translations[lang][id]
        };
        data.push(row);
      }

      // Use baseName as prefix
      const csvFilePath = path.join(OUTPUT_DIR, `${baseName}_${lang}.csv`);
      const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
          {id: 'id', title: 'id'},
          {id: 'zh', title: 'zh'},
          {id: lang, title: lang}
        ]
      });

      csvWriter.writeRecords(data)
        .then(() => console.log(`The CSV file was written successfully for ${csvFilePath}`));
    }

    console.log('\x1b[36m', `Total: ${totalRows} rows, Converted: ${validRows} rows`);
    if (totalRows !== validRows) {
      console.error('\x1b[33m', 'Some data is missing, please check.');
    } else {
      console.log('\x1b[32m', `Data conversion complete, check in ${OUTPUT_DIR} directory.`);
    }
  });
});
