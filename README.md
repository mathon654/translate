# getStr.sh

## 【简介】：
getStr.sh 是一个用于提取项目中代码中的中文字符，并生成对应的i18n键的Node.js脚本。它会遍历指定目录中的代码文件（.js、.ts、.jsx、.tsx、.vue），查找其中的中文字符，并为每个中文字符生成唯一的i18n键。生成的结果将以CSV文件的形式保存在 output 目录下的 translations.csv 文件中。

## 【使用方法】：
1. 确保已安装 Node.js 和 yarn。
2. 打开终端（Terminal）应用程序。
3. 进入项目目录。
4. 运行脚本
```bash
sh getStr.sh
```
5. 脚本将提示输入要检查的目录。如果没有输入，脚本将默认检查当前目录下的 "src" 目录。
6. 脚本默认的id为中文前四个拼音字母
7. 脚本将在指定目录中查找代码文件，并提取其中的中文字符。
8. 生成的 i18n 键和对应的中文字符信息将保存在 output 目录下的 translations.csv 文件中。

# Yaml to CSV Converter

这个 Node.js 脚本用于将存储在 "yarml" 目录下的 YAML 文件转换为 CSV 文件。每个 YAML 文件都会被转换为一个同名的 CSV 文件，这些 CSV 文件将被存储在 "yarml" 目录中。

## 运行要求

- Node.js
- npm

## 如何使用

首先，安装必要的依赖：

```bash
npm install js-yaml csv-writer
```

然后，你可以通过运行以下命令来执行脚本：

```bash
node yamlTocsv.js
```

## 输入

这个脚本将读取 "yarml" 目录下的所有 YAML 文件。每个 YAML 文件应该包含一个嵌套的键值对结构，如下所示：

```yaml
preId1:
  id1: value1
  id2: value2
preId2:
  id1: value1
  id2: value2
```

## 输出

对于每个 YAML 文件，这个脚本将生成一个同名的 CSV 文件，这些文件将被存储在 "yarml" 目录中。每个 CSV 文件将包含以下列：

- preId
- id
- en-us

其中，"preId" 和 "id" 列对应于 YAML 文件中的键，"en-us" 列对应于 YAML 文件中的值。

## 注意事项

这个脚本假设 "yarml" 目录是位于你运行这个脚本的位置的同级目录。如果 "yarml" 目录位于其他地方，你需要调整脚本中的路径。

此外，这个脚本假设每个 YAML 文件的结构都是一样的。如果有的文件的结构和其他的不一样，这个脚本可能会失败或者产生错误的结果。如果你的 YAML 文件有不同的结构，你可能需要对这个脚本进行进一步的修改。
