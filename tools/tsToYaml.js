const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const jsDir = '../tsToYaml/src';
const outputDir = '../tsToYaml/output';

// 获取目录下的所有.js文件
let jsFiles = fs.readdirSync(jsDir).filter(file => path.extname(file) === '.js');

jsFiles.forEach(jsFile => {
  // 动态加载.js文件
  const content = require(path.join(jsDir, jsFile));

  // 将对象内容转换为YAML格式
  const yamlContent = yaml.dump(content);

  // 定义输出的YAML文件名
  const yamlFilename = path.basename(jsFile, '.js') + '.yaml';
  const outputPath = path.join(outputDir, yamlFilename);

  // 将内容写入YAML文件
  fs.writeFileSync(outputPath, yamlContent, 'utf8');
  console.log(`Converted ${jsFile} to ${yamlFilename}`);
});

console.log(`Conversion complete. The files have been saved to ${outputDir}`);
