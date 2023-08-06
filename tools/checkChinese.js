const fs = require("fs");
const path = require("path");
// 输出目录名称
const outputDir = '../output';

// 检查目录是否存在，如果不存在则创建
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// 列出要排除的文件或文件夹名称
const excludeFilesAndDirs = [
  "countryList.ts",
  "countryList.js",
  "node_modules"
];

// 用于保存检测到的中文信息
const chineseCharsInfo = [];

// 检查代码中是否包含中文字符
function hasChineseCharInCode(code, filepath) {
  // 删除单行注释
  const codeWithoutSingleLineComments = code.replace(/\/\/.*/g, "");

  // 删除多行注释
  const codeWithoutMultiLineComments = codeWithoutSingleLineComments.replace(
    /\/\*[\s\S]*?\*\//g,
    ""
  );

  // 删除HTML注释
  const codeWithoutHTMLComments = codeWithoutMultiLineComments.replace(
    /<!--[\s\S]*?-->/g,
    ""
  );

  // 检查是否包含中文字符
  const chineseCharPattern = /[\u4e00-\u9fa5]/;

  // 按行分割代码
  const lines = codeWithoutHTMLComments.split("\n");

  // 遍历每一行
  for (let i = 0; i < lines.length; i++) {
    if (chineseCharPattern.test(lines[i])) {
      chineseCharsInfo.push({
        path: filepath,
        chinese: lines[i].trim(), // 使用trim()方法去除前后的空白字符
        lineNumber: i + 1
      });
    }
  }
}

// 遍历指定文件夹
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    // 如果文件或文件夹在排除列表中，则跳过
    if (excludeFilesAndDirs.includes(file)) {
      continue;
    }
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walkDir(filepath);
    } else if (stats.isFile()) {
      const ext = path.extname(filepath);
      if ([".js", ".ts", ".jsx", ".tsx", ".vue"].includes(ext)) {
        const code = fs.readFileSync(filepath, "utf-8");
        hasChineseCharInCode(code, filepath);
      }
    }
  }
}

// 将检测到的中文信息写入CSV文件
function writeResultsToCsv() {
  const csvContent = ["FilePath,ChineseChar,LineNumber"];
  for (const info of chineseCharsInfo) {
    csvContent.push(`"${info.path}","${info.chinese}",${info.lineNumber}`);
  }
  // 修改输出路径，确保它位于outputDir中
  const outputPath = path.join(outputDir, "getChinese.csv");
  fs.writeFileSync(outputPath, csvContent.join("\n"), "utf-8");
  console.log("已将检测到的中文字符信息写入 getChinese.csv");
}

// 在项目src目录下运行
walkDir("../src");

// 将检测结果写入CSV文件
writeResultsToCsv();
