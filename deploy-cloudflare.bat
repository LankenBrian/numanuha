@echo off
chcp 65001 >nul
echo ===================================
echo  Cloudflare Pages Deploy Script
echo ===================================
echo.

cd /d "C:\root\.openclaw\workspace-dev\image-bg-remover"

echo [1/4] Installing Wrangler...
call npm install -g wrangler

echo.
echo [2/4] Logging into Cloudflare...
call wrangler login

echo.
echo [3/4] Deploying to Pages...
call wrangler pages deploy dist --project-name=imagebgremover --production

echo.
echo [4/4] Setting API Key secret...
call wrangler pages secret put REMOVE_BG_API_KEY --project=imagebgremover

echo.
echo ===================================
echo  Deployment Complete!
echo ===================================
echo.
echo Please enter your API key when prompted: CMzuCXd1A8GPjzPJGecpQ95r
echo.
pause