# Vercel Deployment Script
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Vercel Deployment Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if vercel CLI is available
$vercelPath = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelPath) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host ""
Write-Host "Step 1: Checking Vercel login status..." -ForegroundColor Green
$whoami = npx vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "You need to login to Vercel first." -ForegroundColor Yellow
    Write-Host "Running: npx vercel login" -ForegroundColor Cyan
    npx vercel login
} else {
    Write-Host "Already logged in as: $whoami" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Setting environment variables..." -ForegroundColor Green
Write-Host "This will prompt you to enter your REMOVE_BG_API_KEY" -ForegroundColor Yellow
$npx vercel env add REMOVE_BG_API_KEY

Write-Host ""
Write-Host "Step 3: Deploying to Vercel..." -ForegroundColor Green
Write-Host "------------------------------------------" -ForegroundColor Cyan
npx vercel --prod

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Deployment process complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
