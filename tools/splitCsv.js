const fs = require('fs');
const csv = require('csv-parser');
const path = require("path");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const EXCLUDED_COLUMNS = ['version', 'comment', 'preId', 'id'];
const CSV_DIR = '../splitCsv/src';
const OUTPUT_DIR = '../splitCsv/output';

let csvFiles = fs.readdirSync(CSV_DIR).filter(file => path.extname(file) === '.csv');

csvFiles.forEach(CSV_FILE => {
  let usedPairs = []; // Store pairs of id and preId
  let totalRows = 0;
  let validRows = 0;
  let translations = {};

  let baseName = path.basename(CSV_FILE, '.csv');

  fs.createReadStream(path.join(CSV_DIR, CSV_FILE))
    .pipe(csv())
    .on('data', row => {
      totalRows++;

      let id = row['id'];
      let preId = row['preId'];

      if (!id && !preId) {
        throw new Error(`Both id and preId of row ${totalRows} are empty!`);
      }

      let pair = `${id}_${preId}`;

      if (usedPairs.includes(pair)) {
        // If both id and preId are duplicated, skip the row
        return;
      }

      ['version', 'comment', 'preId', 'id', 'zh'].forEach(col => {
        if (!translations[col]) {
          translations[col] = {};
        }
        translations[col][pair] = row[col];
      });

      for (let lang in row) {
        if (!EXCLUDED_COLUMNS.includes(lang)) {
          if (!translations[lang]) {
            translations[lang] = {};
          }
          translations[lang][pair] = row[lang];
        }
      }

      usedPairs.push(pair);
      validRows++;
    }).on('end', () => {
    for (let lang in translations) {
      if (EXCLUDED_COLUMNS.includes(lang.trim())) continue;  // Skip non-language columns

      const data = [];
      for (let pair in translations[lang]) {
        const row = {
          version: translations['version'][pair],
          comment: translations['comment'][pair],
          preId: translations['preId'][pair],
          id: translations['id'][pair],
          zh: translations['zh'][pair],
          [lang]: translations[lang][pair]
        };
        data.push(row);
      }

      const csvFilePath = path.join(OUTPUT_DIR, `${baseName}_${lang}.csv`);
      const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
          {id: 'version', title: 'version'},
          {id: 'comment', title: 'comment'},
          {id: 'preId', title: 'preId'},
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
