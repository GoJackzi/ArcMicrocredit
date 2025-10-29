# Verify Contract Script (Windows PowerShell)

# This script verifies your deployed contract on ArcScan
# Make sure you have ARCSCAN_API_KEY in your .env file

$CONTRACT_ADDRESS = "0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73"
$CONTRACT_NAME = "ReputationCredit"
$CONTRACT_PATH = "src/ReputationCredit.sol:ReputationCredit"

Write-Host "🔍 Verifying Contract on ArcScan" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contract Address: $CONTRACT_ADDRESS"
Write-Host "Contract Name: $CONTRACT_NAME"
Write-Host ""

# Load environment variables
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^\s*([^#\s]+)\s*=\s*(.+)$') {
            $name = $matches[1]
            $value = $matches[2] -replace '^["\']|["\']$', ''
            Set-Item -Path "env:$name" -Value $value
        }
    }
} else {
    Write-Host "❌ Error: .env file not found" -ForegroundColor Red
    exit 1
}

if (-not $env:ARCSCAN_API_KEY) {
    Write-Host "⚠️  Warning: ARCSCAN_API_KEY not set in .env" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can verify manually:" -ForegroundColor Yellow
    Write-Host "1. Visit ArcScan: https://testnet.arcscan.app"
    Write-Host "2. Navigate to contract page"
    Write-Host "3. Click 'Verify Contract' button"
    Write-Host ""
    Write-Host "OR use cast to interact with unverified contracts!" -ForegroundColor Green
    exit 1
}

Write-Host "🔨 Building contracts..." -ForegroundColor Cyan
forge build

Write-Host ""
Write-Host "✅ Verifying contract..." -ForegroundColor Cyan
forge verify-contract `
  $CONTRACT_ADDRESS `
  $CONTRACT_PATH `
  --chain-id 5042002 `
  --rpc-url https://rpc.testnet.arc.network `
  --verifier-url https://testnet.arcscan.app/api `
  --verifier etherscan `
  --etherscan-api-key $env:ARCSCAN_API_KEY

Write-Host ""
Write-Host "✅ Verification submitted!" -ForegroundColor Green
Write-Host "🌐 Check status: https://testnet.arcscan.app/address/$CONTRACT_ADDRESS"

