const fs = require("fs");
const path = require("path");
const {pinyin} = require("pinyin");
const CHINESE_PINYIN_LENGTH = 4;

const outputDir = '../output';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}
const detectedSentencesByDir = {};
const detectedGlobalSentences = new Set();

const detectedChinese = [];
const excludeFilesAndDirs = [
  "countryList.ts",
  "countryList.js",
  "node_modules"
];
const fileExtensions = [".js", ".ts", ".jsx", ".tsx", ".vue"];

function containsChinese(str) {
  return /[\u4e00-\u9fa5]/.test(str);
}

//判断是否有引号
function hasQuotationMarks(str) {
  return /["']/g.test(str);
}

function extractData(str, pattern, filepath, index,select=false) {
  const regex = new RegExp(pattern, "g");
  let match;
  while ((match = regex.exec(str)) !== null) {
    addToDetectedList(select?match[0]:match[1], filepath, index);
  }
}

function addToDetectedList(str, path, index) {
  if (containsChinese(str)) {
    const sentence = str.trim();
    // 对所有获取到的中文句子进行去重
    if (detectedGlobalSentences.has(sentence)) {
      return;  // 如果句子已经被全局检测到，则直接返回
    }
    detectedGlobalSentences.add(sentence);

    //针对同一个目录中的中文进行去重
    const dir = path.match(/(.*\/)[^/]+\./)[1];  // 获取文件的目录路径
    const preKey = path.match(/\/([^/]+)\./)[1];
    let key = chineseToI18nKey(str);
    // 初始化该目录的集合（如果还没有初始化）
    if (!detectedSentencesByDir[dir]) {
      detectedSentencesByDir[dir] = {
        sentences: new Set(),
        keys: new Set()
      };
    }
    // 检查该句子是否已经在该目录中被检测到
    if (detectedSentencesByDir[dir].sentences.has(sentence)) {
      return;  // 如果已检测到，则直接返回
    }
    // Ensure unique key in the directory
    let suffix = 1;  // Suffix to append to the key if it's not unique
    while (detectedSentencesByDir[dir].keys.has(key)) {
      key = chineseToI18nKey(str) + suffix;
      suffix++;
    }

    // 将句子和键添加到对应的目录的集合中
    detectedSentencesByDir[dir].sentences.add(sentence);
    detectedSentencesByDir[dir].keys.add(key);
    const comment = `t('${preKey}.${key}')`;
    detectedChinese.push({
      filepath: `${path}:${index}`,
      sentence,
      preKey,
      key,
      comment
    });
  }
}


function processLine(line, filepath, index) {
    extractData(line, /"([^"]+)"/, filepath, index);
    extractData(line, /'([^']+)'/, filepath, index);
    extractData(line, /[\u4e00-\u9fa5\s]+/, filepath, index,true);
}

function processFileContent(content, filepath) {

  content = content.replace(
    /\/\/.*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g,
    ""
  ).replace(/console\.[\w]+\([^)]*\);?/g, '');
  const lines = content.split("\n");
  lines.forEach((line, index) => {
    if (containsChinese(line)) {
      processLine(line, filepath, index);
    }
  });
}

function walkDir(dir) {
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (e) {
    console.error(`Failed to read directory ${dir}:`, e);
    return;
  }

  files.forEach(file => {
    if (excludeFilesAndDirs.includes(file)) return;

    const filepath = path.join(dir, file);
    let stats;
    try {
      stats = fs.statSync(filepath);
    } catch (e) {
      console.error(`Failed to get stats for ${filepath}:`, e);
      return;
    }

    if (stats.isDirectory()) {
      walkDir(filepath);
    } else if (fileExtensions.includes(path.extname(filepath))) {
      let content;
      try {
        content = fs.readFileSync(filepath, "utf-8");
      } catch (e) {
        console.error(`Failed to read file ${filepath}:`, e);
        return;
      }
      processFileContent(content, filepath);
    }
  });
}
// 生成i18n key
function chineseToI18nKey(chineseStr) {
  //去除非中文字符
  chineseStr = chineseStr.replace(/[^\u4e00-\u9fa5]/gi, '');
  // 如果中文字符串的长度超过4，只取前4个字符
  if (chineseStr.length > CHINESE_PINYIN_LENGTH) {
    chineseStr = chineseStr.substring(0, 4);
  }

  const words = pinyin(chineseStr, {
    style: pinyin.STYLE_NORMAL,
    heteronym: false
  }).flat();

  return words.map((word, index) => {
    if (index === 0) {
      return word.toLowerCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join('');
}

function writeResultsToCsv() {
  const BOM = "\uFEFF";
  const csvContent = [`${BOM}comment,FilePath,preId,id,zh-cn,en-us`];
  detectedChinese.forEach(item => {
    const {preKey,filepath,sentence,key,comment} = item;
    const escapedSentence = sentence.replace(/"/g, '""');
    csvContent.push(`"${comment}","${filepath}","${preKey}","${key}","${escapedSentence}","en"`);
  });

  try {
    // 修改输出路径，确保它位于outputDir中
    const outputPath = path.join(outputDir, "translations.csv");
    fs.writeFileSync(outputPath, csvContent.join("\n"), "utf-8");
    console.log("已将检测到的中文字符信息写入 translations.csv");
  } catch (e) {
    console.error("Failed to write to CSV:", e);
  }
}

walkDir("../src");
writeResultsToCsv();
