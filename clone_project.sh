#!/bin/bash

# 项目 GitHub 地址
REPO_URL="https://github.com/Merlin-Liu/mahjong-ledger.git"
PROJECT_NAME="mahjong-ledger"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}开始克隆项目...${NC}"
echo -e "仓库地址: ${YELLOW}${REPO_URL}${NC}"
echo -e "目标目录: ${YELLOW}$(pwd)/${PROJECT_NAME}${NC}"
echo ""

# 检查目录是否已存在
if [ -d "$PROJECT_NAME" ]; then
    echo -e "${YELLOW}警告: 目录 ${PROJECT_NAME} 已存在${NC}"
    read -p "是否删除并重新克隆? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}删除旧目录...${NC}"
        rm -rf "$PROJECT_NAME"
    else
        echo -e "${RED}取消操作${NC}"
        exit 1
    fi
fi

# 克隆项目
echo -e "${GREEN}正在克隆项目...${NC}"
if git clone "$REPO_URL" "$PROJECT_NAME"; then
    echo -e "${GREEN}✓ 项目克隆成功！${NC}"
    echo ""
    
    # 进入项目目录
    cd "$PROJECT_NAME" || exit 1
    echo -e "${GREEN}已进入项目目录: ${YELLOW}$(pwd)${NC}"
    echo ""
    
    # 显示项目信息
    echo -e "${GREEN}项目信息:${NC}"
    echo -e "  当前分支: ${YELLOW}$(git branch --show-current)${NC}"
    echo -e "  最新提交: ${YELLOW}$(git log -1 --oneline)${NC}"
    echo ""
    
    # 检查是否有 .env 文件
    if [ ! -f ".local.env" ] && [ ! -f ".prod.env" ]; then
        echo -e "${YELLOW}提示: 未找到环境变量配置文件，请创建 .local.env 或 .prod.env${NC}"
    fi
    
    echo -e "${GREEN}完成！可以开始配置和部署了。${NC}"
else
    echo -e "${RED}✗ 克隆失败，请检查网络连接和仓库地址${NC}"
    exit 1
fi

