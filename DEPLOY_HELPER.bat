@echo off
chcp 65001 >nul
echo ===================================
echo  Image BG Remover - Deploy Helper
echo ===================================
echo.
echo This script will help you deploy to Cloudflare Pages.
echo.
echo Please run the following commands in your terminal:
echo.
echo 1. Open PowerShell as Administrator
echo 2. Run these commands:
echo.
echo    cd "C:\root\.openclaw\workspace-dev\image-bg-remover"
echo    setx CLOUDFLARE_API_TOKEN "cfut_41zvMcZrtL0NafJDaHTr8rzD6zk2QwNykipt7lu0c927ffaf"
echo    npx wrangler pages deploy dist --project-name=bgremover
echo.
echo 3. When prompted, enter your API key:
echo    CMzuCXd1A8GPjzPJGecpQ95r
echo.
echo ===================================
echo.
pause