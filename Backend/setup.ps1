# ESA Billing Backend - Quick Start

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ESA Billing Backend Setup                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Please edit .env and configure:" -ForegroundColor Yellow
    Write-Host "   1. FIREBASE_PROJECT_ID" -ForegroundColor White
    Write-Host "   2. SESSION_SECRET (use a random string)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}

# Check if serviceAccountKey.json exists
if (-Not (Test-Path "serviceAccountKey.json")) {
    Write-Host ""
    Write-Host "❌ serviceAccountKey.json not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download your Firebase service account key:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://console.firebase.google.com/" -ForegroundColor White
    Write-Host "2. Select your project" -ForegroundColor White
    Write-Host "3. Go to Project Settings > Service Accounts" -ForegroundColor White
    Write-Host "4. Click 'Generate New Private Key'" -ForegroundColor White
    Write-Host "5. Save as 'serviceAccountKey.json' in this directory" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
} else {
    Write-Host "✅ serviceAccountKey.json exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Testing Firebase connection..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Run setup script
npm run setup-db

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
    Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "To start the server, run:" -ForegroundColor Cyan
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Setup failed. Please check the errors above." -ForegroundColor Red
    Write-Host ""
}
