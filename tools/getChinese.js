const fs = require("fs");
const path = require("path");
const {pinyin} = require("pinyin");
const OUTPUT_DIR = '../output';
const EXCLUDE_FILES_AND_DIRS = [
  "countryList.ts",
  "countryList.js",
  "node_modules"
];
const FILE_EXTENSIONS = [".js", ".ts", ".jsx", ".tsx", ".vue"];
const CHINESE_REGEX = /[\u4e00-\u9fa5]/;
const CHINESE_PINYIN_LENGTH = 4;

class ChineseDetector {
  constructor() {

    this.detectedSentencesByDir = {};
    this.detectedGlobalSentences = new Set();
    this.detectedLines = {};
    this.detectedChinese = [];

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR);
    }
  }

  containsChinese(str) {
    return CHINESE_REGEX.test(str);
  }

  addToDetectedList(str, path, index) {
    if (this.containsChinese(str)) {
      const sentence = str.trim();

      const filepath = path + ":" + index;
      let existingSentence = this.detectedLines[filepath];
      if (existingSentence && (sentence.indexOf(existingSentence) !== -1 || existingSentence.indexOf(sentence) !== -1)) {
        if (sentence.length <= existingSentence.length) {
          return;
        }
        this.detectedLines[filepath] = sentence;
      } else {
        this.detectedLines[filepath] = sentence;
      }
      if (this.detectedGlobalSentences.has(sentence)) {
        return;
      }
      this.detectedGlobalSentences.add(sentence);
      const dir = path.match(/(.*\/)[^/]+\./)[1];
      const preKey = path.match(/\/([^/]+)\./)[1];
      let key = this.chineseToI18nKey(str);
      if (!this.detectedSentencesByDir[dir]) {
        this.detectedSentencesByDir[dir] = {
          sentences: new Set(),
          keys: new Set()
        };
      }
      if (this.detectedSentencesByDir[dir].sentences.has(sentence)) {
        return;
      }
      let suffix = 1;
      while (this.detectedSentencesByDir[dir].keys.has(key)) {
        key = this.chineseToI18nKey(str) + suffix;
        suffix++;
      }
      this.detectedSentencesByDir[dir].sentences.add(sentence);
      this.detectedSentencesByDir[dir].keys.add(key);
      const comment = `t('${preKey}.${key}')`;
      this.detectedChinese.push({
        filepath,
        sentence,
        preKey,
        key,
        comment
      });
    }

  }

  extractChinese(str) {
    const results = [];
    str=str.trim();
    while (str) {
      if (!this.containsChinese(str)) return results;

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

  processLine(line, filepath, index) {
    if (this.containsChinese(line)) {
      const matches = this.extractChinese(line);
      matches.forEach(match => {
        this.addToDetectedList(match, filepath, index);
      });
    }

  }

  processFileContent(content, filepath) {
    content = content.replace(
      /\/\/.*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g,
      ""
    ).replace(/console\.[\w]+\([^)]*\);?/g, '');
    const lines = content.split("\n");
    lines.forEach((line, index) => {
      if (this.containsChinese(line)) {
        this.processLine(line, filepath, index);
      }
    });

  }

  walkDir(dir) {
    let files;
    try {
      files = fs.readdirSync(dir);
    } catch (e) {
      console.error(`Failed to read directory ${dir}:`, e);
      return;
    }

    files.forEach(file => {
      if (EXCLUDE_FILES_AND_DIRS.includes(file)) return;

      const filepath = path.join(dir, file);
      let stats;
      try {
        stats = fs.statSync(filepath);
      } catch (e) {
        console.error(`Failed to get stats for ${filepath}:`, e);
        return;
      }

      if (stats.isDirectory()) {
        this.walkDir(filepath);
      } else if (FILE_EXTENSIONS.includes(path.extname(filepath))) {
        let content;
        try {
          content = fs.readFileSync(filepath, "utf-8");
        } catch (e) {
          console.error(`Failed to read file ${filepath}:`, e);
          return;
        }
        this.processFileContent(content, filepath);
      }
    });
  }

  chineseToI18nKey(chineseStr) {
    chineseStr = chineseStr.replace(/[^\u4e00-\u9fa5]/gi, '');
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

  writeResultsToCsv() {
    const BOM = "\uFEFF";
    const csvContent = [`${BOM}comment,FilePath,preId,id,zh-cn,en-us`];
    this.detectedChinese.forEach(item => {
      const {preKey,filepath,sentence,key,comment} = item;
      const escapedSentence = sentence.replace(/"/g, '""');
      csvContent.push(`"${comment}","${filepath}","${preKey}","${key}","${escapedSentence}","en"`);
    });

    try {
      const outputPath = path.join(OUTPUT_DIR, "translations.csv");
      fs.writeFileSync(outputPath, csvContent.join("\n"), "utf-8");
      console.log("已将检测到的中文字符信息写入 translations.csv");
    } catch (e) {
      console.error("Failed to write to CSV:", e);
    }
  }

  run() {
    this.walkDir("../src");
    this.writeResultsToCsv();
  }
}

const detector = new ChineseDetector();
detector.run();

