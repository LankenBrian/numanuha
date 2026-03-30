@echo off
chcp 65001 >nul
echo ===================================
echo  Vercel Deploy Script
echo ===================================
echo.

cd /d "C:\root\.openclaw\workspace-dev\image-bg-remover"

echo [1/4] Installing Vercel CLI...
call npm install -g vercel

echo.
echo [2/4] Logging into Vercel...
call vercel login

echo.
echo [3/4] Deploying project...
call vercel --prod --name imagebgremover

echo.
echo [4/4] Setting environment variable...
call vercel env add REMOVE_BG_API_KEY

echo.
echo ===================================
echo  Deployment Complete!
echo ===================================
echo.
echo Please enter your API key when prompted: CMzuCXd1A8GPjzPJGecpQ95r
echo.
pause