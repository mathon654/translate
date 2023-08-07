const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const yamlDir = '../yaml';

// Get the list of yaml files in the "yarml" directory
let yamlFiles = fs.readdirSync(yamlDir).filter(file => path.extname(file) === '.yaml');

// Process each yaml file
for (let yamlFile of yamlFiles) {
  // Load the yaml file
  let yamlData = yaml.load(fs.readFileSync(path.join(yamlDir, yamlFile), 'utf8'));

  let csvData = [];

  // Convert the yaml data to csv data
  for (let [preId, content] of Object.entries(yamlData)) {
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
    path: path.join(yamlDir, path.basename(yamlFile, '.yaml') + '.csv'),
    header: [
      {id: 'preId', title: 'preId'},
      {id: 'id', title: 'id'},
      {id: 'en-us', title: 'en-us'}
    ]
  });

  // Write the csv file
  csvWriter.writeRecords(csvData, 'utf8')
    .then(() => console.log(`The CSV file was written successfully for ${yamlFile}`));
}
