# Quick Setup Script - PowerShell Version
# Just run: .\quick-setup.ps1 YOUR_WALLET_ADDRESS

param(
    [Parameter(Mandatory=$true)]
    [string]$YourWalletAddress
)

$CONTRACT = "0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73"
$RPC_URL = "https://rpc.testnet.arc.network"

Write-Host "Quick Setup - Arc Microcredit Protocol" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contract: $CONTRACT"
Write-Host "Your Wallet: $YourWalletAddress"
Write-Host ""

# Try to find cast command
$castCmd = "cast"
if (-not (Get-Command cast -ErrorAction SilentlyContinue)) {
    # Try common Foundry installation paths
    $foundryPaths = @(
        "$env:USERPROFILE\.foundry\bin\cast.exe",
        "$env:LOCALAPPDATA\.foundry\bin\cast.exe",
        "C:\Users\$env:USERNAME\.foundry\bin\cast.exe"
    )
    
    foreach ($path in $foundryPaths) {
        if (Test-Path $path) {
            $castCmd = $path
            Write-Host "Found cast at: $castCmd" -ForegroundColor Green
            break
        }
    }
    
    if ($castCmd -eq "cast" -and -not (Test-Path $castCmd)) {
        Write-Host "Error: Foundry (cast) not found in PATH" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install Foundry:" -ForegroundColor Yellow
        Write-Host "  1. Open PowerShell as Administrator" -ForegroundColor Yellow
        Write-Host "  2. Run: curl -L https://foundry.paradigm.xyz | bash" -ForegroundColor Yellow
        Write-Host "  3. Or download from: https://book.getfoundry.sh/getting-started/installation" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "After installing, restart PowerShell and try again." -ForegroundColor Yellow
        exit 1
    }
}

# Load .env if exists
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^\s*([^#\s]+)\s*=\s*(.+)$') {
            $name = $matches[1]
            $value = $matches[2] -replace "^['`"]|['`"]$", ''
            Set-Item -Path "env:$name" -Value $value
        }
    }
} else {
    Write-Host "Warning: No .env file found. Creating one..." -ForegroundColor Yellow
    $envContent = "ARC_TESTNET_RPC_URL=$RPC_URL`nPRIVATE_KEY=0x..."
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "Please edit .env and add your PRIVATE_KEY" -ForegroundColor Yellow
    exit 1
}

if (-not $env:PRIVATE_KEY -or $env:PRIVATE_KEY -eq "0x...") {
    Write-Host "Error: PRIVATE_KEY not set in .env" -ForegroundColor Red
    Write-Host "Please edit .env and add your PRIVATE_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Authorizing your wallet as lender..." -ForegroundColor Green

& $castCmd send $CONTRACT `
  "addAuthorizedLender(address)" $YourWalletAddress `
  --rpc-url $RPC_URL `
  --private-key $env:PRIVATE_KEY

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to authorize wallet. Check your PRIVATE_KEY and RPC connection." -ForegroundColor Red
    Write-Host ""
    Write-Host "You can also run manually:" -ForegroundColor Yellow
    Write-Host "  $castCmd send $CONTRACT `"addAuthorizedLender(address)`" $YourWalletAddress --rpc-url $RPC_URL --private-key YOUR_PRIVATE_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Your wallet is now authorized as a lender!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test frontend: cd ../frontend; npm run dev" -ForegroundColor White
Write-Host "  2. Create profiles: $castCmd send $CONTRACT 'createCreditProfile(address,uint256)' USER_ADDRESS 750 --rpc-url $RPC_URL --private-key `$env:PRIVATE_KEY" -ForegroundColor White
Write-Host "  3. Approve loans: $castCmd send $CONTRACT 'approveLoan(address,uint256)' BORROWER_ADDRESS 0 --rpc-url $RPC_URL --private-key `$env:PRIVATE_KEY" -ForegroundColor White
Write-Host ""
Write-Host "Contract: https://testnet.arcscan.app/address/$CONTRACT"
