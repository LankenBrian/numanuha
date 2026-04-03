#!/bin/bash
# Cloudflare Pages 部署脚本 (Git Bash)

echo "=========================================="
echo "BG Remover Pro - Cloudflare Pages 部署"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd "$(dirname "$0")" || exit 1

# 检查 wrangler 是否登录
echo "[1/3] 检查 Cloudflare 登录状态..."
if ! npx wrangler whoami > /dev/null 2>&1; then
    echo -e "${YELLOW}未登录 Cloudflare，开始登录...${NC}"
    npx wrangler login
    if [ $? -ne 0 ]; then
        echo -e "${RED}登录失败${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ 已登录 Cloudflare${NC}"
echo ""

# 检查构建输出是否存在
if [ ! -d ".vercel/output/static" ]; then
    echo "[2/3] 构建输出不存在，开始构建..."
    
    echo "安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}依赖安装失败${NC}"
        exit 1
    fi
    
    echo "生成 Prisma 客户端..."
    npx prisma generate
    if [ $? -ne 0 ]; then
        echo -e "${RED}Prisma 客户端生成失败${NC}"
        exit 1
    fi
    
    echo "构建项目..."
    npm run pages:build
    if [ $? -ne 0 ]; then
        echo -e "${RED}构建失败${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}[2/3] 构建输出已存在，跳过构建${NC}"
fi
echo ""

# 部署
echo "[3/3] 部署到 Cloudflare Pages..."
npx wrangler pages deploy .vercel/output/static --project-name=bg-remover-pro
if [ $? -ne 0 ]; then
    echo -e "${RED}部署失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 部署完成${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}部署成功!${NC}"
echo "访问地址: https://bg-remover-pro.pages.dev"
echo "=========================================="
echo ""
echo "下一步:"
echo "1. 在 Cloudflare Dashboard 设置环境变量"
echo "2. 或使用: npx wrangler secret put <变量名>"
echo ""

read -p "按回车键继续..."
