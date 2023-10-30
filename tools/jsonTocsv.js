const fs = require('fs');
const path = require('path');
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;

const jsonDir = '../toCsv_json/src';
const outputCSV = '../toCsv_json/output/translations.csv';

let jsonFiles = fs.readdirSync(jsonDir).filter(file => path.extname(file) === '.json');

let accumulatedData = {};

for (let jsonFile of jsonFiles) {
  let jsonData = JSON.parse(fs.readFileSync(path.join(jsonDir, jsonFile), 'utf8'));
  let columnName = path.basename(jsonFile, '.json');  // Use the filename (without extension) as the column name

    for (let [id, value] of Object.entries(jsonData)) {
      let combinedId = `${id}`;  // A combined key to uniquely identify the entry
      if (!accumulatedData[combinedId]) {
        accumulatedData[combinedId] = {
          version: '',       // Initialize version and comment with empty values
          comment: '',
          id: id
        };
      }

      accumulatedData[combinedId][columnName] = value;
    }
  }

// Convert the accumulated data to CSV format
let csvData = Object.values(accumulatedData);

// Set header with "version" and "comment" as the first two columns, followed by dynamic headers
let header = [
  { id: 'version', title: 'version' },
  { id: 'comment', title: 'comment' }
].concat(Object.keys(csvData[0]).filter(key => key !== 'version' && key !== 'comment').map(key => ({ id: key, title: key })));

const csvStringifier = createCsvStringifier({
  header: header
});

// Convert data to CSV string format
const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(csvData);
const BOM = "\ufeff";
fs.writeFileSync(outputCSV, BOM + csvString, 'utf8');

console.log(`The consolidated CSV file was written successfully at ${outputCSV}`);
