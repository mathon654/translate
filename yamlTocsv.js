const fs = require('fs');
const yaml = require('js-yaml');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Load the yaml file
let enYaml = yaml.load(fs.readFileSync('en.yaml', 'utf8'));

let csvData = [];

// Convert the yaml data to csv data
for (let [preId, content] of Object.entries(enYaml)) {
  for (let [id, value] of Object.entries(content)) {
    csvData.push({
      preId: preId,
      id: id,
      'en-us': value
    });
  }
}

// Define the csv writer
const csvWriter = createCsvWriter({
  path: 'out.csv',
  header: [
    {id: 'preId', title: 'preId'},
    {id: 'id', title: 'id'},
    {id: 'en-us', title: 'en-us'}
  ]
});

// Write the csv file
csvWriter.writeRecords(csvData,'utf8')
  .then(() => console.log('The CSV file was written successfully'));
