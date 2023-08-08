#!/bin/bash

# 定义ANSI转义序列颜色常量
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # 恢复默认颜色

# 获取当前脚本文件的绝对路径
script_path="$(dirname "$(realpath "$0")")"

# 获取Mac下载目录路径
download_directory="$HOME/Downloads"

# 指定要复制的文件名（可以根据实际情况修改）
file_to_copy="translations.csv"

# 切换到脚本文件所在的目录
cd "$script_path"


while true; do
    # 选择要检查文件所在的目录
    echo -e "${YELLOW}请拖入要检查的目录（默认为当前目录下的 'src' ）：${NC}"
    #open .
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
    rm -rf "$script_path/src"
    # 确保 src 目录已被删除
    if [ -d "$script_path/src" ]; then
        echo -e "${RED}无法删除 src 目录！${NC}"
        exit 1
    fi
    echo -e "${GREEN}src 目录清空完成！${NC}"

    echo -e "${YELLOW}复制选择的目录到脚本的目录下...${NC}"
    # 复制选择的目录到脚本的目录下，并重命名为 "src"
    cp -r "$src_directory" "$script_path/src"
    echo -e "${GREEN}复制完成！${NC}"

    # 切换到脚本所在目录
    cd "$script_path"

#    echo -e "${YELLOW}执行 yarn install...${NC}"
#    # 执行 yarn install
#    yarn install
#    echo -e "${GREEN}yarn install 完成！${NC}"

    echo -e "${YELLOW}执行 yarn getChinese...${NC}"
    # 执行 yarn getChinese
    yarn getChinese
    echo -e "${GREEN}yarn getChinese 完成！${NC}"

#    # 打开脚本所在目录的文件夹下的 output 文件夹
#    echo -e "${YELLOW}打开 output 文件夹...${NC}"
#    #open output/translations.csv
#    open output/

    # 检查output文件夹是否存在，并复制指定文件到下载目录
    if [ -d "$script_path/output" ]; then
        # 检查指定文件是否存在
        if [ -f "$script_path/output/$file_to_copy" ]; then
            echo "复制 $file_to_copy 文件到下载目录..."
            cp "$script_path/output/$file_to_copy" "$download_directory"
            echo "复制完成！"

            # 打开下载文件夹
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
