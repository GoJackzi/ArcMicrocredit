# Manual Contract Verification Guide

## ✅ Quick Manual Verification

Since Foundry isn't installed, here's the **easiest way** to verify:

### Option 1: Via ArcScan UI (Easiest - No Code Needed!)

1. **Go to**: https://testnet.arcscan.app/address/0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73
2. **Click**: "Verify Contract" or "Verify and Publish" button
3. **Fill in the form**:
   - **Compiler Version**: `v0.8.20+commit.a1b79de6`
   - **License**: `MIT`
   - **Optimization**: `Yes`
   - **Runs**: `200`
   - **Source Code**: Copy entire content from `src/ReputationCredit.sol`
4. **Click**: "Verify and Publish"
5. **Wait**: A few seconds for verification
6. **Done!** ✅

### Option 2: Install Foundry in WSL (For Future Use)

```bash
# In WSL terminal:
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup

# Then verify:
cd /mnt/g/Arc-Microcredit-Protocol/backend
forge verify-contract \
  0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73 \
  src/ReputationCredit.sol:ReputationCredit \
  --chain-id 5042002 \
  --rpc-url https://rpc.testnet.arc.network \
  --verifier-url https://testnet.arcscan.app/api \
  --verifier etherscan
```

## 📋 What You Need

- **Contract Address**: `0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73`
- **Source Code**: `src/ReputationCredit.sol`
- **Compiler**: `0.8.20`
- **Optimization**: Yes (200 runs)
- **License**: MIT

## 🎯 Recommendation

**Use Option 1 (ArcScan UI)** - It's the fastest and doesn't require installing anything!

Just copy-paste your source code and submit. Takes 30 seconds.

---

**Remember:** Verification is optional! Your contract works perfectly without it.

