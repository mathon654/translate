const fs = require("fs");
const csv = require("csv-parser");
const yaml = require("js-yaml");

// 常量定义
const EN_FILE = "en.yaml";
const ZH_FILE = "zh-CN.yaml";
const CSV_FILE = "../outPut/translations.csv";
const LOCAL_DIR = "../locales";

let data = [];
let totalRows = 0;
let validRows = 0;
const usedIds = [];
const stream = fs.createReadStream(CSV_FILE);

if (!fs.existsSync(LOCAL_DIR)) {
  fs.mkdirSync(LOCAL_DIR);
}

stream
  .pipe(csv())
  .on("data", row => {
    totalRows++;

    const preId = row["preId"];
    const id = row["id"];

    // 检查是否有id
    if (!id) {
      throw new Error(`The id of row ${totalRows} is empty!`);
    }

    // 初始化preId
    if (preId && !usedIds[preId]) {
      usedIds[preId] = [];
    }

    // 检查id是否重复
    if (usedIds[preId] && usedIds[preId].includes(id)) {
      throw new Error(
        `The id "${id}" in row ${totalRows} under preId "${preId}" is duplicated!`
      );
    }

    // 检查en-us列是否为空
    if (row["en-us"] == null || row["en-us"] === "") {
      throw new Error(
        `The value for id "${id}" in the "en-us" column of row ${totalRows} is empty!`
      );
    }

    // 检查zh-cn列是否为空
    if (row["zh-cn"] == null || row["zh-cn"] === "") {
      throw new Error(
        `The value for id "${id}" in the "zh-cn" column of row ${totalRows} is empty!`
      );
    }

    // 记录已使用的id
    usedIds.push(id);
    validRows++;

    data.push(row);
  })
  .on("end", () => {
    const enYaml = {};
    const zhYaml = {};
    let preId = "test";

    // Skip the first row
    data = data.slice(0);

    for (const row of data) {
      if (row.preId) {
        preId = row.preId;
        if (!enYaml[preId]) {
          enYaml[preId] = {};
        }
        if (!zhYaml[preId]) {
          zhYaml[preId] = {};
        }
      }

      if (row.id) {
        enYaml[preId][row.id] = row["en-us"];
        zhYaml[preId][row.id] = row["zh-cn"];
      }
    }

    fs.writeFileSync(
      `${LOCAL_DIR}/${EN_FILE}`,
      yaml.dump(enYaml, { noCompatMode: true, lineWidth: Infinity }),
      "utf8"
    );
    fs.writeFileSync(
      `${LOCAL_DIR}/${ZH_FILE}`,
      yaml.dump(zhYaml, { noCompatMode: true, lineWidth: Infinity }),
      "utf8"
    );

    // 输出结果
    console.log("\x1b[36m", `一共: ${totalRows}条，转换完成 : ${validRows}条`);
    if (totalRows !== validRows) {
      console.error("\x1b[33m", "数据有缺失，请检查");
    } else {
      console.log("\x1b[32m", `数据转换完成，请在${LOCAL_DIR}文件夹中查看`);
    }
  })
  .on("error", err => {
    console.error(err.message);
  });
