# Redeploy Contract Script for Arc Testnet
# This script builds and deploys the ReputationCredit contract with decentralized functions

param(
    [switch]$SkipBuild = $false,
    [switch]$SkipVerify = $false
)

Write-Host "🚀 ReputationCredit Contract Redeployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check for Foundry
Write-Host "📋 Step 1: Checking Foundry installation..." -ForegroundColor Yellow
$foundryPaths = @(
    "$HOME\.foundry\bin",
    "$env:LOCALAPPDATA\.foundry\bin",
    "$env:ProgramFiles\.foundry\bin"
)

$forgePath = $null
foreach ($path in $foundryPaths) {
    $forgeExe = Join-Path $path "forge.exe"
    if (Test-Path $forgeExe) {
        $forgePath = $path
        break
    }
}

# Check if forge is in PATH
if (-not $forgePath) {
    $forgeCmd = Get-Command forge -ErrorAction SilentlyContinue
    if ($forgeCmd) {
        $forgePath = Split-Path $forgeCmd.Source
    }
}

if (-not $forgePath) {
    Write-Host "❌ Foundry not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Foundry:" -ForegroundColor Yellow
    Write-Host "  1. WSL/Linux: curl -L https://foundry.paradigm.xyz | bash" -ForegroundColor White
    Write-Host "  2. Or visit: https://book.getfoundry.sh/getting-started/installation" -ForegroundColor White
    Write-Host ""
    Write-Host "For Windows, you can:" -ForegroundColor Yellow
    Write-Host "  - Install WSL and use Linux Foundry commands" -ForegroundColor White
    Write-Host "  - Use Docker with Foundry image" -ForegroundColor White
    Write-Host "  - Use GitHub Actions for deployment" -ForegroundColor White
    exit 1
}

Write-Host "✅ Foundry found at: $forgePath" -ForegroundColor Green
$env:Path = "$forgePath;$env:Path"

# Step 2: Load environment variables
Write-Host ""
Write-Host "📋 Step 2: Loading environment variables..." -ForegroundColor Yellow
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env from env.example" -ForegroundColor Yellow
    exit 1
}

# Parse .env file
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#\s]+)\s*=\s*(.+)$') {
        $name = $matches[1]
        $value = $matches[2] -replace "^['`"]|['`"]$", ''
        Set-Item -Path "env:$name" -Value $value
    }
}

if (-not $env:PRIVATE_KEY -or $env:PRIVATE_KEY -eq "0x...") {
    Write-Host "❌ PRIVATE_KEY not set in .env" -ForegroundColor Red
    exit 1
}

if (-not $env:ARC_TESTNET_RPC_URL) {
    Write-Host "❌ ARC_TESTNET_RPC_URL not set in .env" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment variables loaded" -ForegroundColor Green

# Step 3: Build contract
if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "📋 Step 3: Building contract..." -ForegroundColor Yellow
    $buildOutput = forge build 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        Write-Host $buildOutput
        exit 1
    }
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⏭️  Skipping build (--SkipBuild flag)" -ForegroundColor Yellow
}

# Step 4: Check wallet balance
Write-Host ""
Write-Host "📋 Step 4: Checking wallet balance..." -ForegroundColor Yellow
$walletAddress = & cast wallet address --private-key $env:PRIVATE_KEY 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to get wallet address" -ForegroundColor Red
    Write-Host $walletAddress
    exit 1
}

$balance = & cast balance --rpc-url $env:ARC_TESTNET_RPC_URL $walletAddress 2>&1
Write-Host "   Wallet: $walletAddress" -ForegroundColor Cyan
Write-Host "   Balance: $balance wei" -ForegroundColor Cyan

# Step 5: Deploy contract
Write-Host ""
Write-Host "📋 Step 5: Deploying contract..." -ForegroundColor Yellow
$verifyArgs = ""
if (-not $SkipVerify -and $env:ARCSCAN_API_KEY) {
    $verifyArgs = "--verify --etherscan-api-key $env:ARCSCAN_API_KEY --verifier-url https://testnet.arcscan.app/api --verifier etherscan"
}

$deployCmd = "forge script script/DeployReputationCredit.s.sol:DeployReputationCredit --rpc-url $env:ARC_TESTNET_RPC_URL --private-key $env:PRIVATE_KEY --broadcast $verifyArgs"

Write-Host "   Running: $deployCmd" -ForegroundColor Gray
$deployOutput = Invoke-Expression $deployCmd 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host $deployOutput
    exit 1
}

# Extract contract address from output
$contractAddress = $null
if ($deployOutput -match "deployed at:\s*(0x[a-fA-F0-9]{40})") {
    $contractAddress = $matches[1]
} elseif ($deployOutput -match "ReputationCredit deployed at:\s*(0x[a-fA-F0-9]{40})") {
    $contractAddress = $matches[1]
}

if (-not $contractAddress) {
    # Try to get it from broadcast JSON
    $broadcastFile = Get-ChildItem -Path "broadcast\DeployReputationCredit.s.sol\5042002" -Filter "run-latest.json" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($broadcastFile) {
        $broadcast = Get-Content $broadcastFile.FullName | ConvertFrom-Json
        $contractAddress = $broadcast.transactions | Where-Object { $_.contractName -eq "ReputationCredit" } | Select-Object -First 1 -ExpandProperty contractAddress
    }
}

Write-Host "✅ Deployment successful!" -ForegroundColor Green

if ($contractAddress) {
    Write-Host ""
    Write-Host "📍 Contract Address: $contractAddress" -ForegroundColor Cyan
    Write-Host "🌐 Explorer: https://testnet.arcscan.app/address/$contractAddress" -ForegroundColor Cyan
    Write-Host ""
    
    # Step 6: Update frontend .env
    Write-Host "📋 Step 6: Updating frontend environment..." -ForegroundColor Yellow
    $frontendEnv = "..\frontend\.env.local"
    $frontendEnvTemplate = "NEXT_PUBLIC_CONTRACT_ADDRESS=`"$contractAddress`""
    
    if (Test-Path $frontendEnv) {
        $content = Get-Content $frontendEnv
        $updated = $false
        $newContent = $content | ForEach-Object {
            if ($_ -match "^NEXT_PUBLIC_CONTRACT_ADDRESS=") {
                $updated = $true
                $frontendEnvTemplate
            } else {
                $_
            }
        }
        if (-not $updated) {
            $newContent += $frontendEnvTemplate
        }
        $newContent | Set-Content $frontendEnv
        Write-Host "✅ Updated $frontendEnv" -ForegroundColor Green
    } else {
        $frontendEnvTemplate | Set-Content $frontendEnv
        Write-Host "✅ Created $frontendEnv" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "✅ Redeployment Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Restart frontend: cd ..\frontend; npm run dev" -ForegroundColor White
    Write-Host "  2. Test: Create a credit profile from the frontend" -ForegroundColor White
    Write-Host "  3. Verify: Check ArcScan for contract verification status" -ForegroundColor White
} else {
    Write-Host "⚠️  Could not extract contract address automatically" -ForegroundColor Yellow
    Write-Host "   Check the deployment output above for the contract address" -ForegroundColor Yellow
}

