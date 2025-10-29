# Script to compile contracts using Foundry
# Tries to find forge in common locations or uses WSL

Write-Host "🔍 Looking for forge compiler..."

# Try Windows paths
$forgePaths = @(
    "$env:USERPROFILE\.foundry\bin\forge.exe",
    "$env:LOCALAPPDATA\foundry\bin\forge.exe",
    "C:\Users\$env:USERNAME\.foundry\bin\forge.exe",
    "C:\foundry\bin\forge.exe"
)

$forgeFound = $false
foreach ($path in $forgePaths) {
    if (Test-Path $path) {
        Write-Host "✅ Found forge at: $path"
        & $path build
        $forgeFound = $true
        break
    }
}

if (-not $forgeFound) {
    Write-Host "⚠️  forge.exe not found in Windows. Trying WSL..."
    wsl bash -c "cd /mnt/g/Arc-Microcredit-Protocol/backend && forge build"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Compilation successful via WSL"
        $forgeFound = $true
    } else {
        Write-Host "❌ Compilation failed. Please install Foundry:"
        Write-Host "   Windows: curl -L https://foundry.paradigm.xyz | bash"
        Write-Host "   Then: foundryup"
        exit 1
    }
}

