#!/bin/bash

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== 服务诊断工具 ===${NC}\n"

# 1. 检查 PM2 服务状态
echo -e "${YELLOW}1. 检查 PM2 服务状态:${NC}"
pm2 status
echo ""

# 2. 检查端口占用
echo -e "${YELLOW}2. 检查 3000 端口占用:${NC}"
if netstat -tlnp 2>/dev/null | grep -q ":3000 "; then
    echo -e "${GREEN}✓ 端口 3000 正在被占用${NC}"
    netstat -tlnp 2>/dev/null | grep ":3000 "
else
    echo -e "${RED}✗ 端口 3000 未被占用${NC}"
fi
echo ""

# 3. 检查 PM2 日志
echo -e "${YELLOW}3. 最近的 PM2 日志 (最后 20 行):${NC}"
pm2 logs mahjong-ledger --lines 20 --nostream 2>/dev/null || echo -e "${RED}无法获取日志${NC}"
echo ""

# 4. 检查应用日志文件
echo -e "${YELLOW}4. 检查应用日志文件:${NC}"
if [ -f "./logs/pm2-error.log" ]; then
    echo -e "${GREEN}错误日志 (最后 10 行):${NC}"
    tail -n 10 ./logs/pm2-error.log
else
    echo -e "${YELLOW}错误日志文件不存在${NC}"
fi
echo ""

if [ -f "./logs/pm2-out.log" ]; then
    echo -e "${GREEN}输出日志 (最后 10 行):${NC}"
    tail -n 10 ./logs/pm2-out.log
else
    echo -e "${YELLOW}输出日志文件不存在${NC}"
fi
echo ""

# 5. 检查环境变量文件
echo -e "${YELLOW}5. 检查环境变量配置:${NC}"
if [ -f ".prod.env" ]; then
    echo -e "${GREEN}.prod.env 存在${NC}"
    grep -E "^(PORT|NODE_ENV)=" .prod.env 2>/dev/null || echo "未找到 PORT 或 NODE_ENV"
else
    echo -e "${RED}.prod.env 不存在${NC}"
fi
echo ""

# 6. 检查 Node.js 进程
echo -e "${YELLOW}6. 检查 Node.js 进程:${NC}"
ps aux | grep -E "node|pm2" | grep -v grep || echo -e "${RED}未找到 Node.js 进程${NC}"
echo ""

# 7. 测试本地连接
echo -e "${YELLOW}7. 测试本地连接:${NC}"
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 服务可以访问${NC}"
    curl -s http://localhost:3000/ | head -n 5
else
    echo -e "${RED}✗ 服务无法访问${NC}"
fi
echo ""

# 8. 建议操作
echo -e "${BLUE}=== 建议操作 ===${NC}"
echo "如果服务未运行，请执行："
echo "  pm2 start ecosystem.config.js --env production"
echo ""
echo "如果服务运行但无法访问，请检查："
echo "  1. 查看详细日志: pm2 logs mahjong-ledger"
echo "  2. 重启服务: pm2 restart mahjong-ledger"
echo "  3. 检查数据库连接是否正常"

