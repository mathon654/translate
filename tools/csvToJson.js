// 导入依赖
const fs = require('fs');
const csv = require('csv-parser');
const prettier = require('prettier');
const EXCLUDED_COLUMNS = ['id', 'version', 'comment'];
// 常量定义
const CSV_FILE = '../csvToJson/src/demo_tranlateions.csv';
const LOCAL_DIR = '../csvToJson/output';

// 初始化变量
let translations = {};
let totalRows = 0;
let validRows = 0;
let usedIds = [];

// 创建输出目录
fs.mkdirSync(LOCAL_DIR, { recursive: true });

// 读取CSV文件并进行解析
fs.createReadStream(CSV_FILE)
  .pipe(csv())
  .on('data', row => {
    totalRows++;

    const id = row['id'];

    // 检查是否有id
    if (!id) {
      throw new Error(`The id of row ${totalRows} is empty!`);
    }

    // 检查id是否重复
    if (usedIds.includes(id)) {
      throw new Error(`The id "${id}" in row ${totalRows} is duplicated!`);
    }

    // 动态处理每种语言
    for (let lang in row) {
      if (!EXCLUDED_COLUMNS.includes(lang) && row[lang]) {
        if (!translations[lang]) {
          translations[lang] = {};
        }
        translations[lang][id] = row[lang];
      }
    }

    // 记录已使用的id
    usedIds.push(id);
    validRows++;
  })
  .on('end', () => {
    // 对每种语言生成文件
    for (let lang in translations) {
      const content = prettier.format(JSON.stringify(translations[lang]), { parser: 'json' });
      fs.writeFileSync(`${LOCAL_DIR}/${lang}.json`, content);
    }

    // 输出结果
    console.log('\x1b[36m', `一共: ${totalRows}条，转换完成 : ${validRows}条`);
    if (totalRows !== validRows) {
      console.error('\x1b[33m', '数据有缺失，请检查');
    } else {
      console.log('\x1b[32m', `数据转换完成，请在${LOCAL_DIR}文件夹中查看`);
    }
  });
