@echo off
chcp 65001 >nul
echo ==========================================
echo BG Remover Pro - Cloudflare Pages 部署脚本
echo ==========================================
echo.

REM 检查是否安装了 wrangler
where wrangler >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 wrangler CLI
    echo 请先安装: npm install -g wrangler
    exit /b 1
)

echo [1/5] 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败
    exit /b 1
)
echo ✓ 依赖安装完成
echo.

echo [2/5] 生成 Prisma 客户端...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [错误] Prisma 客户端生成失败
    exit /b 1
)
echo ✓ Prisma 客户端生成完成
echo.

echo [3/5] 构建项目 (Cloudflare Pages)...
call npm run pages:build
if %errorlevel% neq 0 (
    echo [错误] 构建失败
    exit /b 1
)
echo ✓ 构建完成
echo.

echo [4/5] 部署到 Cloudflare Pages...
echo 正在部署...
call npx wrangler pages deploy .vercel/output/static
if %errorlevel% neq 0 (
    echo [错误] 部署失败
    exit /b 1
)
echo ✓ 部署完成
echo.

echo [5/5] 部署后检查...
echo 请检查以下事项:
echo   - 环境变量是否已设置 (wrangler secret put)
echo   - Stripe Webhook URL 是否更新
echo   - 数据库迁移是否完成
echo.

echo ==========================================
echo 部署完成!
echo 访问地址: https://bg-remover-pro.pages.dev
echo ==========================================

pause
