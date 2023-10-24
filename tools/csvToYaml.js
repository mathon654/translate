const fs = require("fs");
const csv = require("csv-parser");
const yaml = require("js-yaml");

// 常量定义
const CSV_FILE = "../outPut/translations.csv";
const LOCAL_DIR = "../locales";

let data = [];
let totalRows = 0;
let validRows = 0;
const usedIds = {};
const stream = fs.createReadStream(CSV_FILE);
let headers = [];

if (!fs.existsSync(LOCAL_DIR)) {
  fs.mkdirSync(LOCAL_DIR);
}

stream
  .pipe(csv())
  .on("headers", (headerList) => {
    headers = headerList.filter(header => !["comment", "FilePath", "preId", "id"].includes(header));
  })
  .on("data", row => {
    totalRows++;
    const preId = row["preId"];
    const id = row["id"];

    if (!id) {
      throw new Error(`The id of row ${totalRows} is empty!`);
    }

    if (preId && !usedIds[preId]) {
      usedIds[preId] = [];
    }

    if (usedIds[preId] && usedIds[preId].includes(id)) {
      throw new Error(`The id "${id}" in row ${totalRows} under preId "${preId}" is duplicated!`);
    }

    usedIds[preId] = [...(usedIds[preId] || []), id];
    validRows++;

    data.push(row);
  })
  .on("end", () => {
    const yamlData = {};

    for (const header of headers) {
      yamlData[header] = {};
    }

    for (const row of data) {
      const preId = row["preId"] || "root";
      const id = row["id"];

      for (const header of headers) {
        if (!yamlData[header][preId]) {
          yamlData[header][preId] = {};
        }
        yamlData[header][preId][id] = row[header];
      }
    }

    for (const header of headers) {
      const filePath = `${LOCAL_DIR}/${header}.yaml`;
      fs.writeFileSync(
        filePath,
        yaml.dump(yamlData[header], { noCompatMode: true, lineWidth: Infinity }),
        "utf8"
      );
    }

    console.log(`一共: ${totalRows}条，转换完成: ${validRows}条`);
    if (totalRows !== validRows) {
      console.error("数据有缺失，请检查");
    } else {
      console.log(`数据转换完成，请在${LOCAL_DIR}文件夹中查看`);
    }
  })
  .on("error", err => {
    console.error(err.message);
  });
