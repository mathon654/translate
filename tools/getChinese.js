const fs = require("fs");
const path = require("path");

const detectedChinese = []; // 用于保存检测到的中文句子信息

// 列出要排除的文件或文件夹名称
const excludeFilesAndDirs = [
  "countryList.ts",
  "countryList.js",
  "node_modules"
];

const fileExtensions = [".js", ".ts", ".jsx", ".tsx", ".vue"];

//判断是否有中文
function containsChinese(str) {
  return /[\u4e00-\u9fa5]/.test(str);
}
//判断是否有引号
function hasQuotationMarks(str) {
  return /["']/g.test(str);
}
//取出正则表达式中的字符串
function extractDataUsingRegex(str, regexPattern, path, index) {
  const regex = new RegExp(regexPattern, "g");
  let matches;
  const results = [];
  while ((matches = regex.exec(str)) !== null) {
    pushData(matches[1], path, index);
    results.push(matches[1]);
  }
  return results;
}

//判断是否为中文push到detectedChinese中
function pushData(str, path, index) {
  if (containsChinese(str)) {
    const filepath = `${path}:${index}`;
    detectedChinese.push({
      filepath: filepath, // 添加行号到文件路径
      sentence: str.trim()
    });
  }
}

// 删除注释并查找中文
function processFileContent(content, filepath) {
  const codeWithoutComments = content.replace(
    /\/\/.*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g,
    ""
  );

  // 分行处理
  const lines = codeWithoutComments.split("\n");
  lines.forEach((line, index) => {
    //判断是否有中文
    if (containsChinese(line)) {
      //判断是否有引号
      if (hasQuotationMarks(line)) {
        //取出双引号中的字符串
        extractDataUsingRegex(line, /"([^"]+)"/, filepath, index);
        //取出单引号中的字符串
        extractDataUsingRegex(line, /'([^']+)'/, filepath, index);
      } else {
        //取出中文字符串
        extractDataUsingRegex(line, /[\u4e00-\u9fa5\s]+/, filepath, index);
      }
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

  for (const file of files) {
    if (excludeFilesAndDirs.includes(file)) continue;

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
        continue;
      }
      processFileContent(content, filepath);
    }
  }
}

function writeResultsToCsv() {
  const BOM = "\uFEFF";
  const csvContent = [`${BOM}FilePath,ChineseSentence`];
  detectedChinese.forEach(item => {
    const escapedSentence = item.sentence.replace(/"/g, '""');
    csvContent.push(`"${item.filepath}","${escapedSentence}"`);
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
