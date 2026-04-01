@echo off
chcp 65001 >nul
echo ==========================================
echo Vercel Deployment Script
echo ==========================================
echo.

REM Check if vercel is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

echo.
echo Step 1: Login to Vercel (if not already logged in)
echo ------------------------------------------
npx vercel login

echo.
echo Step 2: Set environment variable
echo ------------------------------------------
npx vercel env add REMOVE_BG_API_KEY

echo.
echo Step 3: Deploy to Vercel
echo ------------------------------------------
npx vercel --prod

echo.
echo ==========================================
echo Deployment complete!
echo ==========================================
pause
