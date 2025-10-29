# 🚀 EASIEST WAY TO GET STARTED

## Step 1: Edit .env file

Open `G:\Arc-Microcredit-Protocol\backend\.env` and make sure you have:

```env
ARC_TESTNET_RPC_URL="https://rpc.testnet.arc.network"
PRIVATE_KEY="0xYOUR_PRIVATE_KEY_HERE"
REPUTATION_CREDIT_CONTRACT_ADDRESS="0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73"
```

## Step 2: Run the quick setup script

### Windows PowerShell:
```powershell
cd G:\Arc-Microcredit-Protocol\backend
.\quick-setup.ps1 YOUR_WALLET_ADDRESS
```

Replace `YOUR_WALLET_ADDRESS` with your actual wallet address (like `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`)

### Or manually authorize:
```powershell
cast send 0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73 `
  "addAuthorizedLender(address)" YOUR_WALLET_ADDRESS `
  --rpc-url https://rpc.testnet.arc.network `
  --private-key $env:PRIVATE_KEY
```

## Step 3: Test the frontend!

```powershell
cd G:\Arc-Microcredit-Protocol\frontend
npm run dev
```

Open http://localhost:3000 and connect your wallet!

---

## 🎯 That's it!

- ✅ Your wallet is authorized
- ✅ Contract is deployed  
- ✅ Frontend works
- ✅ You can create profiles and approve loans

**No verification needed!** Everything works without it.

---

## 📋 Quick Commands Reference

**Create a profile:**
```powershell
cast send 0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73 `
  "createCreditProfile(address,uint256)" USER_ADDRESS 750 `
  --rpc-url https://rpc.testnet.arc.network `
  --private-key $env:PRIVATE_KEY
```

**Approve a loan:**
```powershell
cast send 0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73 `
  "approveLoan(address,uint256)" BORROWER_ADDRESS 0 `
  --rpc-url https://rpc.testnet.arc.network `
  --private-key $env:PRIVATE_KEY
```

---

**Need help?** The script will guide you!

