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
