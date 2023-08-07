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
let detectedLines = {};
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

function addToDetectedList(str, path, index) {
  if (containsChinese(str)) {
    const sentence = str.trim();

    // Check for overlap in the same file and line
    const filepath = path + ":" + index;
    let existingSentence = detectedLines[filepath];
    if (existingSentence && (sentence.indexOf(existingSentence) !== -1 || existingSentence.indexOf(sentence) !== -1)) {
      if (sentence.length <= existingSentence.length) {
        return;  // If the new sentence is shorter or equal, we skip adding it
      }
      // If the new sentence is longer, we update the existing sentence
      detectedLines[filepath] = sentence;
    } else {
      detectedLines[filepath] = sentence;
    }

    // Global sentences deduplication
    if (detectedGlobalSentences.has(sentence)) {
      return;
    }
    detectedGlobalSentences.add(sentence);

    // Deduplication per directory
    const dir = path.match(/(.*\/)[^/]+\./)[1];
    const preKey = path.match(/\/([^/]+)\./)[1];
    let key = chineseToI18nKey(str);
    if (!detectedSentencesByDir[dir]) {
      detectedSentencesByDir[dir] = {
        sentences: new Set(),
        keys: new Set()
      };
    }
    if (detectedSentencesByDir[dir].sentences.has(sentence)) {
      return;
    }
    let suffix = 1;
    while (detectedSentencesByDir[dir].keys.has(key)) {
      key = chineseToI18nKey(str) + suffix;
      suffix++;
    }
    detectedSentencesByDir[dir].sentences.add(sentence);
    detectedSentencesByDir[dir].keys.add(key);
    const comment = `t('${preKey}.${key}')`;
    detectedChinese.push({
      filepath,
      sentence,
      preKey,
      key,
      comment
    });
  }
}

function processLine(line, filepath, index) {
  if (containsChinese(line)) {
    // Extract Chinese content
    const matches = extractChinese(line);
    matches.forEach(match => {
      addToDetectedList(match, filepath, index);
    });
  }
}

function extractChinese(str) {
  const results = [];
  str=str.trim();
  while (str) {
    if (!containsChinese(str)) return results;

    let match;
    if ((match = str.match(/"([^"]*[\u4e00-\u9fa5]+[^"]*)"/))) {
      results.push(match[1]);
      str = str.replace(match[0], '');
    } else if ((match = str.match(/<([^>]*[\u4e00-\u9fa5]+[^>]*)>/))) {
      results.push(match[1]);
      str = str.replace(match[0], '');
    } else if ((match = str.match(/'([^']*[\u4e00-\u9fa5]+[^']*)'/))) {
      results.push(match[1]);
      str = str.replace(match[0], '');
    } else {
      // 获取不在引号和尖括号中的中文内容
      match = str.match(/[\u4e00-\u9fa5][^]*[\u4e00-\u9fa5]/);
      if (match) {
        results.push(match[0]);
        str = str.replace(match[0], '');
      } else {
        break;
      }
    }
  }
  return results;
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
