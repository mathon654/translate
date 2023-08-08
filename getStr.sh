#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # 恢复默认颜色

# 获取当前脚本文件的绝对路径
#script_path="$(dirname "$(realpath "$0")")"
script_path="$(cd "$(dirname "$0")" && pwd)"

# 获取Mac下载目录路径
download_directory="$HOME/Downloads"

# 指定要复制的文件名（可以根据实际情况修改）
file_to_copy="translations.csv"

cd "$script_path" || exit

while true; do
    echo -e "${YELLOW}请拖入要检查的目录（默认为当前目录下的 'src' ）：${NC}"
    read -p "> " src_directory
    if [ -z "$src_directory" ]; then
        src_directory="src"
    fi

    if [ ! -d "$src_directory" ]; then
        echo -e "${RED}错误：指定的检查文件目录不存在！${NC}"
        exit 1
    fi
    echo -e "${YELLOW}清空 src 目录...${NC}"
    rm -rf "$script_path/src"
    if [ -d "$script_path/src" ]; then
        echo -e "${RED}无法删除 src 目录！${NC}"
        exit 1
    fi
    echo -e "${GREEN}src 目录清空完成！${NC}"

    echo -e "${YELLOW}复制选择的目录到脚本的目录下...${NC}"
    cp -r "$src_directory" "$script_path/src"
    echo -e "${GREEN}复制完成！${NC}"
    echo -e "${YELLOW}执行 yarn getChinese...${NC}"
    yarn getChinese
    echo -e "${GREEN}yarn getChinese 完成！${NC}"
    if [ -d "$script_path/output" ]; then
        if [ -f "$script_path/output/$file_to_copy" ]; then
            echo "复制 $file_to_copy 文件到下载目录..."
            cp "$script_path/output/$file_to_copy" "$download_directory"
            echo "复制完成！"
            echo "打开下载文件夹..."
            open "$download_directory"
        else
            echo "错误：指定文件 $file_to_copy 不存在或无法访问！"
            exit 1
        fi
    else
        echo "错误：output 文件夹不存在或无法访问！"
        exit 1
    fi

    echo -e "${GREEN}脚本执行完成！${NC}"
done
