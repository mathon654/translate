const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;

const yamlDir = '../toCsv_yaml/src';
const outputCSV = '../toCsv_yaml/output/translations.csv';

// Get the list of yaml files in the "yaml" directory
let yamlFiles = fs.readdirSync(yamlDir).filter(file => path.extname(file) === '.yaml');

// A common structure to store the accumulated data
let accumulatedData = {};

// Process each yaml file
for (let yamlFile of yamlFiles) {
  // Load the yaml file
  let yamlData = yaml.load(fs.readFileSync(path.join(yamlDir, yamlFile), 'utf8'));
  let columnName = path.basename(yamlFile, '.yaml');  // Use the filename (without extension) as the column name

  // Convert the yaml data and merge it into accumulatedData
  for (let [preId, content] of Object.entries(yamlData)) {
    if(typeof content === 'string'){
      let combinedId = `${preId}`;  // A combined key to uniquely identify the entry
      if (!accumulatedData[combinedId]) {
        accumulatedData[combinedId] = {
          version: '',       // Initialize version and comment with empty values
          comment: '',
          preId: preId,
          id: ''
        };
      }
      accumulatedData[combinedId][columnName] = content;
    } else{
      for (let [id, value] of Object.entries(content)) {
        let combinedId = `${preId}_${id}`;  // A combined key to uniquely identify the entry

        if (!accumulatedData[combinedId]) {
          accumulatedData[combinedId] = {
            version: '',       // Initialize version and comment with empty values
            comment: '',
            preId: preId,
            id: id
          };
        }

        accumulatedData[combinedId][columnName] = value;
      }
    }
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
