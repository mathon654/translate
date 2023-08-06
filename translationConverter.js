// 导入依赖
const fs = require("fs");
const csv = require("csv-parser");
const prettier = require("prettier");

// 常量定义
const EN_FILE = "en.json";
const ZH_FILE = "zh.json";
const CSV_FILE = "translations.csv";
const LOCAL_DIR = "local";

// 初始化变量
let en = {};
let zh = {};
let totalRows = 0;
let validRows = 0;
let usedIds = [];

// 创建输出目录
fs.mkdirSync(LOCAL_DIR, { recursive: true });

// 读取CSV文件并进行解析
fs.createReadStream(CSV_FILE)
  .pipe(csv())
  .on("data", (row) => {
    totalRows++;

    const id = row["id"];

    // 检查是否有id
    if (!id) {
      throw new Error(`The id of row ${totalRows} is empty!`);
    }

    // 检查id是否重复
    if (usedIds.includes(id)) {
      throw new Error(`The id "${id}" in row ${totalRows} is duplicated!`);
    }

    // 检查en-us列是否为空
    if (row["en-us"] == null || row["en-us"] === "") {
      throw new Error(`The value for id "${id}" in the "en-us" column of row ${totalRows} is empty!`)
    }

    // 检查zh-cn列是否为空
    if (row["zh-cn"] == null || row["zh-cn"] === "") {
      throw new Error(`The value for id "${id}" in the "zh-cn" column of row ${totalRows} is empty!`)
    }

    // 添加en和zh对应的值
    if (row["en-us"]) {
      en[id] = row["en-us"];
    }

    if (row["zh-cn"]) {
      zh[id] = row["zh-cn"];
    }

    // 记录已使用的id
    usedIds.push(id);
    validRows++;
  })
  .on("end", () => {
    // 检查是否有中文翻译
    if (Object.keys(zh).length === 0) {
      console.log('\x1b[31m',"No Chinese translation found!");
    }
    // 检查是否有英文翻译
    if (Object.keys(en).length === 0) {
      console.log('\x1b[31m',"No English translation found!");
    }

    // 格式化输出
    const enContent = prettier.format(JSON.stringify(en), { parser: "json" });
    const zhContent = prettier.format(JSON.stringify(zh), { parser: "json" });

    // 输出到文件
    fs.writeFileSync(`${LOCAL_DIR}/${EN_FILE}`, enContent);
    fs.writeFileSync(`${LOCAL_DIR}/${ZH_FILE}`, zhContent);

    // 输出结果
    console.log('\x1b[36m',`一共: ${totalRows}条，转换完成 : ${validRows}条`);
    if(totalRows!==validRows){
      console.error('\x1b[33m','数据有缺失，请检查')
    }else {
      console.log('\x1b[32m',`数据转换完成，请在${LOCAL_DIR}文件夹中查看`)
    }

  });
