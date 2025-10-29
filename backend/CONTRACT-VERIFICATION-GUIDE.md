# Guide: Contract Verification & Interaction

## ⚠️ Contract Not Verified - Solutions

Your contract is deployed but not verified. Here are your options:

## ✅ Option 1: Verify the Contract

### Method A: Using Foundry (Recommended)

1. **Get ArcScan API Key** (if available):
   - Visit: https://testnet.arcscan.app
   - Look for API key section in account settings
   - Or contact ArcScan support

2. **Add to .env**:
   ```env
   ARCSCAN_API_KEY="your-api-key-here"
   ```

3. **Run verification script**:
   ```bash
   # In WSL or Git Bash
   cd G:\Arc-Microcredit-Protocol\backend
   bash verify-contract.sh
   
   # Or Windows PowerShell
   .\verify-contract.ps1
   ```

### Method B: Manual Verification via ArcScan UI

1. Go to: https://testnet.arcscan.app/address/0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73
2. Click "Verify Contract" or "Verify and Publish"
3. Enter:
   - Compiler Version: `0.8.20`
   - License: `MIT`
   - Optimization: `Yes` (200 runs)
   - Paste your contract source code from `src/ReputationCredit.sol`
4. Submit

### Method C: Using Foundry Verify Command

```bash
cd G:\Arc-Microcredit-Protocol\backend

forge verify-contract \
  0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73 \
  src/ReputationCredit.sol:ReputationCredit \
  --chain-id 5042002 \
  --rpc-url https://rpc.testnet.arc.network \
  --verifier-url https://testnet.arcscan.app/api \
  --verifier etherscan \
  --etherscan-api-key YOUR_API_KEY
```

---

## ✅ Option 2: Interact with Unverified Contract (Works Now!)

You can interact with unverified contracts using `cast` or the ABI directly!

### Using Cast (Foundry Tool)

**Authorize your wallet:**
```bash
cast send 0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73 \
  "addAuthorizedLender(address)" YOUR_WALLET_ADDRESS \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key YOUR_PRIVATE_KEY
```

**Create a profile:**
```bash
cast send 0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73 \
  "createCreditProfile(address,uint256)" USER_ADDRESS 750 \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key YOUR_PRIVATE_KEY
```

**Approve a loan:**
```bash
cast send 0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73 \
  "approveLoan(address,uint256)" BORROWER_ADDRESS 0 \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key YOUR_PRIVATE_KEY
```

### Using MetaMask + Custom ABI

Even without verification, you can interact via MetaMask:

1. **Get the ABI**:
   - File: `backend/out/ReputationCredit.sol/ReputationCredit.json`
   - Copy the `abi` field

2. **Use MetaMask + Custom Contract**:
   - Open MetaMask
   - Go to "Import Tokens" or use a custom RPC tool
   - Add contract manually with address + ABI
   - Interact directly!

### Using Frontend (Already Works!)

Your frontend already has the ABI loaded from `lib/contract.ts`! It works perfectly with unverified contracts because:
- ✅ Frontend uses the ABI directly (not from explorer)
- ✅ Functions work the same way
- ✅ Only the explorer UI benefits from verification

---

## 🎯 Quick Decision

**For Now:**
- ✅ Use `cast` commands to interact
- ✅ Frontend works perfectly (already has ABI)
- ✅ No verification needed to use the protocol!

**Later:**
- Verify contract for better explorer experience
- Makes it easier for others to interact via ArcScan UI

---

## 📋 Summary

**You don't need verification to use your contract!**

- ✅ Frontend works (uses ABI directly)
- ✅ Cast commands work (use ABI)
- ✅ Protocol functions normally

**Verification only helps:**
- 📖 Read contract code on explorer
- 🖱️ Use ArcScan's "Write Contract" UI
- 📚 Makes it easier for others to understand

---

**Next Steps:**
1. Use `cast` commands to authorize your wallet
2. Test the frontend (it works!)
3. Verify contract later when convenient

See `verify-contract.sh` or `verify-contract.ps1` for verification scripts!

