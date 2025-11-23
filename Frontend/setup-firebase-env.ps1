#!/usr/bin/env pwsh
# Script to help configure Firebase environment variables

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Firebase Environment Setup Helper" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you configure your Firebase credentials." -ForegroundColor Yellow
Write-Host ""

Write-Host "Step 1: Get your Firebase credentials" -ForegroundColor Green
Write-Host "---------------------------------------"
Write-Host "1. Go to: https://console.firebase.google.com/" -ForegroundColor White
Write-Host "2. Select project: esa-billing-website-1ec57" -ForegroundColor White
Write-Host "3. Click the gear icon (⚙️) → Project Settings" -ForegroundColor White
Write-Host "4. Scroll to 'Your apps' section" -ForegroundColor White
Write-Host "5. Find your Web app configuration" -ForegroundColor White
Write-Host ""

Write-Host "Step 2: Enter your credentials below" -ForegroundColor Green
Write-Host "-------------------------------------"
Write-Host ""

$apiKey = Read-Host "Enter FIREBASE_API_KEY"
$authDomain = Read-Host "Enter FIREBASE_AUTH_DOMAIN (or press Enter for default: esa-billing-website-1ec57.firebaseapp.com)"
$projectId = Read-Host "Enter FIREBASE_PROJECT_ID (or press Enter for default: esa-billing-website-1ec57)"
$storageBucket = Read-Host "Enter FIREBASE_STORAGE_BUCKET (or press Enter for default: esa-billing-website-1ec57.appspot.com)"
$messagingSenderId = Read-Host "Enter FIREBASE_MESSAGING_SENDER_ID"
$appId = Read-Host "Enter FIREBASE_APP_ID"

# Use defaults if not provided
if ([string]::IsNullOrWhiteSpace($authDomain)) {
    $authDomain = "esa-billing-website-1ec57.firebaseapp.com"
}
if ([string]::IsNullOrWhiteSpace($projectId)) {
    $projectId = "esa-billing-website-1ec57"
}
if ([string]::IsNullOrWhiteSpace($storageBucket)) {
    $storageBucket = "esa-billing-website-1ec57.appspot.com"
}

Write-Host ""
Write-Host "Creating .env file..." -ForegroundColor Green

$envContent = @"
# Firebase Configuration
# Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

VITE_FIREBASE_API_KEY=$apiKey
VITE_FIREBASE_AUTH_DOMAIN=$authDomain
VITE_FIREBASE_PROJECT_ID=$projectId
VITE_FIREBASE_STORAGE_BUCKET=$storageBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=$messagingSenderId
VITE_FIREBASE_APP_ID=$appId
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8 -Force

Write-Host ""
Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run dev" -ForegroundColor White
Write-Host "2. Run: npx playwright test" -ForegroundColor White
Write-Host ""
Write-Host "If tests still fail, check TEST_FAILURE_FIX.md for troubleshooting" -ForegroundColor Yellow
