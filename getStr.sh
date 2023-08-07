#!/bin/bash

# 定义ANSI转义序列颜色常量
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # 恢复默认颜色

# 获取当前目录作为脚本的工作目录
script_directory=$(pwd)

while true; do
    # 选择要检查文件所在的目录
    echo -e "${YELLOW}请拖入要检查的目录（默认为当前目录下的 'src' ）：${NC}"
    open .
    read -p "> " src_directory

    # 如果输入为空，设置默认目录为 'src'
    if [ -z "$src_directory" ]; then
        src_directory="src"
    fi

    # 检查目录是否存在
    if [ ! -d "$src_directory" ]; then
        echo -e "${RED}错误：指定的检查文件目录不存在！${NC}"
        exit 1
    fi

    # 获取选择的文件夹名称
    src_folder_name=$(basename "$src_directory")

    # 输出每一步的过程
    echo -e "${YELLOW}清空 src 目录...${NC}"
    # 删除 src 目录及其内容
    rm -rf "$script_directory/src"
    # 确保 src 目录已被删除
    if [ -d "$script_directory/src" ]; then
        echo -e "${RED}无法删除 src 目录！${NC}"
        exit 1
    fi
    echo -e "${GREEN}src 目录清空完成！${NC}"

    echo -e "${YELLOW}复制选择的目录到脚本的目录下...${NC}"
    # 复制选择的目录到脚本的目录下，并重命名为 "src"
    cp -r "$src_directory" "$script_directory/src"
    echo -e "${GREEN}复制完成！${NC}"

    # 切换到脚本所在目录
    cd "$script_directory"

    echo -e "${YELLOW}执行 yarn install...${NC}"
    # 执行 yarn install
    yarn install
    echo -e "${GREEN}yarn install 完成！${NC}"

    echo -e "${YELLOW}执行 yarn getChinese...${NC}"
    # 执行 yarn getChinese
    yarn getChinese
    echo -e "${GREEN}yarn getChinese 完成！${NC}"

    # 打开脚本所在目录的文件夹下的 output 文件夹
    echo -e "${YELLOW}打开 output 文件夹...${NC}"
    open output/translations.csv
    echo -e "${GREEN}脚本执行完成！${NC}"
done
