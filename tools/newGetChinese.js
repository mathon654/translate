const fs = require("fs");
const path = require("path");
const {pinyin} = require("pinyin");

const outputDir = '../output';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

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

function extractData(str, pattern, filepath, index) {
  const regex = new RegExp(pattern, "g");
  let match;
  while ((match = regex.exec(str)) !== null) {
    addToDetectedList(match[1], filepath, index);
  }
}

function addToDetectedList(str, path, index) {
  if (containsChinese(str)) {
    const preKey = path.match(/\/([^/]+)\./)[1];
    const key = chineseToI18nKey(str);
    detectedChinese.push({
      filepath: `${path}:${index}`,
      sentence: str.trim(),
      preKey,
      key
    });
  }
}

function processLine(line, filepath, index) {
  extractData(line, /"([^"]+)"/, filepath, index);
  extractData(line, /'([^']+)'/, filepath, index);
  if (!/["']/g.test(line)) {
    extractData(line, /[\u4e00-\u9fa5]+/, filepath, index);
  }
}

function processFileContent(content, filepath) {
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
  // 如果中文字符串的长度超过4，只取前4个字符
  if (chineseStr.length > 4) {
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
  const csvContent = [`${BOM}FilePath,preKey,key,zh,en`];
  detectedChinese.forEach(item => {
    const {preKey,filepath,sentence,key} = item;
    const escapedSentence = sentence.replace(/"/g, '""');
    const escapedKey = key.replace(/"/g, '""');
    csvContent.push(`"${filepath}","${preKey}","${escapedKey}","${escapedSentence}",""`);
  });

  try {
    // 修改输出路径，确保它位于outputDir中
    const outputPath = path.join(outputDir, "getChinese.csv");
    fs.writeFileSync(outputPath, csvContent.join("\n"), "utf-8");
    console.log("已将检测到的中文字符信息写入 getChinese.csv");
  } catch (e) {
    console.error("Failed to write to CSV:", e);
  }
}

walkDir("../src");
writeResultsToCsv();
