# Manual Authorization (if script doesn't work)

# If Foundry's cast isn't in your PATH, use the full path or install Foundry

## Option 1: Install Foundry First

### Windows (via WSL or Git Bash):
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Or download manually:
Visit: https://book.getfoundry.sh/getting-started/installation

After installing, add Foundry to PATH:
```powershell
$env:PATH += ";$env:USERPROFILE\.foundry\bin"
```

Then run:
```powershell
cd G:\Arc-Microcredit-Protocol\backend
.\quick-setup.ps1 0xB1A4e075EA6B04357D6907864FCDF65B73Ea3b6E
```

## Option 2: Use Full Path to Cast

If Foundry is installed but not in PATH:

```powershell
cd G:\Arc-Microcredit-Protocol\backend

# Try this path (adjust if different):
$castPath = "$env:USERPROFILE\.foundry\bin\cast.exe"

# If that doesn't work, find cast.exe:
Get-ChildItem -Path "$env:USERPROFILE" -Filter "cast.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName

# Then use that path:
& $castPath send 0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73 "addAuthorizedLender(address)" 0xB1A4e075EA6B04357D6907864FCDF65B73Ea3b6E --rpc-url https://rpc.testnet.arc.network --private-key YOUR_PRIVATE_KEY
```

## Option 3: Use MetaMask + ArcScan (No Cast Needed!)

1. Open MetaMask
2. Connect to Arc Testnet (Chain ID: 5042002)
3. Go to: https://testnet.arcscan.app/address/0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73
4. Scroll down to "Contract" section
5. Click "Write Contract" or "Interact"
6. Find `addAuthorizedLender` function
7. Enter your wallet address: `0xB1A4e075EA6B04357D6907864FCDF65B73Ea3b6E`
8. Click "Write" and confirm in MetaMask

This works even if the contract isn't verified - you just need to use the ABI directly!

## Option 4: Use Your Frontend!

The frontend already has the ABI! You can:
1. Start the frontend: `cd ../frontend && npm run dev`
2. Connect your wallet
3. The frontend can interact with the contract directly!

---

**Easiest: Use MetaMask + ArcScan (Option 3)** - No installation needed!

