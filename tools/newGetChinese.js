const fs = require("fs");
const path = require("path");

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
    detectedChinese.push({
      filepath: `${path}:${index}`,
      sentence: str.trim()
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

function writeResultsToCsv() {
  const BOM = "\uFEFF";
  const csvContent = [`${BOM}FilePath,preKey,key,zh,en`];
  detectedChinese.forEach(item => {
    const preKey = item.filepath.match(/\/([^/]+)\./)[1];
    const escapedSentence = item.sentence.replace(/"/g, '""');
    csvContent.push(`"${item.filepath}",${preKey},"","${escapedSentence}",""`);
  });

  try {
    fs.writeFileSync("detected_chinese.csv", csvContent.join("\n"), "utf-8");
    console.log("已将检测到的中文句子信息写入 detected_chinese.csv");
  } catch (e) {
    console.error("Failed to write to CSV:", e);
  }
}

walkDir("../src");
writeResultsToCsv();
