# PeptiSync Vercel Deployment Script (PowerShell)
# This script helps you deploy PeptiSync to Vercel quickly

Write-Host "🚀 PeptiSync Vercel Deployment Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
} else {
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Pre-deployment checklist:" -ForegroundColor Yellow
Write-Host ""

# Check if git is clean
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
    Write-Host ""
    git status -s
    Write-Host ""
    $commit = Read-Host "Do you want to commit all changes now? (y/n)"
    if ($commit -eq "y" -or $commit -eq "Y") {
        git add .
        $commitMsg = Read-Host "Enter commit message"
        git commit -m $commitMsg
        Write-Host "✅ Changes committed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Please commit your changes before deploying" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ No uncommitted changes" -ForegroundColor Green
}

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found. Are you in the project root?" -ForegroundColor Red
    exit 1
}
Write-Host "✅ package.json found" -ForegroundColor Green

# Check if vercel.json exists
if (-not (Test-Path "vercel.json")) {
    Write-Host "❌ vercel.json not found. Configuration missing!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ vercel.json found" -ForegroundColor Green

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 Building project locally to check for errors..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Please fix errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🌐 Ready to deploy!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Choose deployment type:" -ForegroundColor Yellow
Write-Host "1) Production deployment (main site)"
Write-Host "2) Preview deployment (testing)"
Write-Host ""
$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "🚀 Deploying to PRODUCTION..." -ForegroundColor Cyan
    Write-Host ""
    vercel --prod
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "🔍 Creating PREVIEW deployment..." -ForegroundColor Cyan
    Write-Host ""
    vercel
} else {
    Write-Host "❌ Invalid choice. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Test your deployed site"
Write-Host "2. Update Supabase allowed URLs"
Write-Host "3. Configure custom domain (optional)"
Write-Host "4. Set up monitoring and analytics"
Write-Host ""
Write-Host "📖 See VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""

