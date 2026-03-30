@echo off
chcp 65001 >nul
echo ===================================
echo  Image BG Remover - Auto Deploy
echo ===================================
echo.

cd /d "%~dp0"

echo [1/5] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo [2/5] Installing Wrangler...
call npm install -g wrangler@latest
if errorlevel 1 (
    echo [ERROR] Failed to install Wrangler
    pause
    exit /b 1
)

echo.
echo [3/5] Checking Cloudflare authentication...
echo If this is your first time, a browser window will open for login.
echo.

:: Try to login (will open browser if not authenticated)
wrangler whoami >nul 2>&1
if errorlevel 1 (
    echo Please login to Cloudflare...
    call wrangler login
    if errorlevel 1 (
        echo [ERROR] Login failed
        pause
        exit /b 1
    )
)

echo.
echo [4/5] Deploying to Cloudflare Pages...
call wrangler pages deploy dist --project-name=bgremover --production --commit-dirty=true
if errorlevel 1 (
    echo [ERROR] Deployment failed
    pause
    exit /b 1
)

echo.
echo [5/5] Setting API Key...
echo Please enter your Remove.bg API key when prompted:
echo CMzuCXd1A8GPjzPJGecpQ95r
echo.
call wrangler pages secret put REMOVE_BG_API_KEY --project=bgremover

echo.
echo ===================================
echo  Deployment Complete!
echo ===================================
echo.
echo Your website will be available at:
echo https://bgremover.pages.dev
echo.
echo To update: Push code to GitHub or run this script again.
echo.
pause