#!/bin/bash

# 定义ANSI转义序列颜色常量
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # 恢复默认颜色

# 选择脚本所在目录
echo -e "${YELLOW}请选择脚本所在目录：${NC}"
read -p "> " script_directory

# 检查目录是否存在
if [ ! -d "$script_directory" ]; then
    echo -e "${RED}错误：指定的脚本目录不存在！${NC}"
    exit 1
fi

# 选择要检查文件所在的目录
echo -e "${YELLOW}请选择要检查文件所在的目录：${NC}"
read -p "> " src_directory

# 检查目录是否存在
if [ ! -d "$src_directory" ]; then
    echo -e "${RED}错误：指定的检查文件目录不存在！${NC}"
    exit 1
fi

# 获取选择的文件夹名称
src_folder_name=$(basename "$src_directory")

# 输出每一步的过程
echo -e "${YELLOW}复制选择的目录到脚本的目录下...${NC}"
# 复制选择的目录到脚本的目录下，并重命名为"src"
cp -r "$src_directory" "$script_directory/src"
echo -e "${GREEN}复制完成！${NC}"

# 切换到脚本所在目录
cd "$script_directory"

echo -e "${YELLOW}执行 yarn newGetChinese...${NC}"
# 执行 yarn newGetChinese
yarn newGetChinese
echo -e "${GREEN}yarn newGetChinese 完成！${NC}"

# 打开脚本所在目录的文件夹下的output文件夹
echo -e "${YELLOW}打开 output 文件夹...${NC}"
open output/translations.csv
echo -e "${GREEN}脚本执行完成！${NC}"

# 保持iTerm不关闭
while true; do
    sleep 1
done
