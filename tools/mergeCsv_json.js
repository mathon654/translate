const fs = require('fs');
const csv = require('csv-parser');
const path = require("path");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const INPUT_DIR = '../splitCsv_json/output';

let csvFiles = fs.readdirSync(INPUT_DIR).filter(file => path.extname(file) === '.csv');

// Organize files by base name
let fileGroups = {};
csvFiles.forEach(CSV_FILE => {
  let baseName = CSV_FILE.split('_')[0];

  if (!fileGroups[baseName]) {
    fileGroups[baseName] = [];
  }

  fileGroups[baseName].push(CSV_FILE);
});

for (let baseName in fileGroups) {
  let finalTranslations = {};

  fileGroups[baseName].forEach(CSV_FILE => {
    fs.createReadStream(path.join(INPUT_DIR, CSV_FILE))
      .pipe(csv())
      .on('data', row => {
        const id = row['id'];

        // Ensure 'id' exists and initialize the translation entry if it doesn't
        if (!finalTranslations[id]) {
          finalTranslations[id] = {};
        }

        // Copy all values from the row to the finalTranslations
        for (let column in row) {
          finalTranslations[id][column] = row[column];
        }
      })
      .on('end', () => {
        // Once all files of the current group have been read, write to the merged CSV
        if (CSV_FILE === fileGroups[baseName][fileGroups[baseName].length - 1]) {
          const headers = ['version', 'comment', 'id'];

          // Find all unique headers from the collected data
          for (let id in finalTranslations) {
            for (let lang in finalTranslations[id]) {
              if (!headers.includes(lang)) {
                headers.push(lang);
              }
            }
          }

          const mergedCsvPath = path.join('../splitCsv_json/src', `${baseName}_translations_merged.csv`);

          const csvWriter = createCsvWriter({
            path: mergedCsvPath,
            header: headers.map(header => ({ id: header, title: header }))
          });

          const data = Object.values(finalTranslations);

          csvWriter.writeRecords(data)
            .then(() => {
              console.log(`Merged CSV file was written successfully at ${mergedCsvPath}`);
            });
        }
      });
  });
}
