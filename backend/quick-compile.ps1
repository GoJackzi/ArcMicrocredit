# Quick compilation guide
Write-Host "`n========================================"
Write-Host "  COMPILATION REQUIRED"
Write-Host "========================================`n"

Write-Host "ProtocolUSDC.sol needs to be compiled. Options:`n"

Write-Host "OPTION 1: Use Remix IDE (5 minutes):" -ForegroundColor Green
Write-Host "  1. Go to https://remix.ethereum.org"
Write-Host "  2. Copy ProtocolUSDC.sol to Remix"
Write-Host "  3. Compile with Solidity 0.8.20"
Write-Host "  4. Copy ABI and bytecode to out/ProtocolUSDC.sol/ProtocolUSDC.json`n"

Write-Host "OPTION 2: Install Foundry via WSL:" -ForegroundColor Yellow  
Write-Host "  wsl"
Write-Host "  curl -L https://foundry.paradigm.xyz | bash"
Write-Host "  foundryup"
Write-Host "  cd /mnt/g/Arc-Microcredit-Protocol/backend"
Write-Host "  forge build`n"

Write-Host "After compilation, run: node deploy.js`n"

Write-Host "Press any key to create minimal artifact file (NOT RECOMMENDED - won't work properly)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

