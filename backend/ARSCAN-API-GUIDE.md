# ArcScan API Verification Guide

## 🔍 ArcScan API Endpoints

Based on the ArcScan API docs (https://testnet.arcscan.app/api-docs?tab=rest_api), you'll need:

### Contract Verification Endpoint

ArcScan typically uses Etherscan-compatible API endpoints. The verification endpoint is usually:

**POST** `/api`
**Parameters:**
- `module=contract`
- `action=verifysourcecode` (or `verifysourcecode`)
- `apikey=YOUR_API_KEY`
- `contractaddress=CONTRACT_ADDRESS`
- `sourceCode=CONTRACT_SOURCE_CODE`
- `codeformat=solidity-single-file` (or `solidity-standard-json-input`)
- `contractname=ReputationCredit`
- `compilerversion=v0.8.20+commit.a1b79de6`
- `optimizationUsed=1`
- `runs=200`
- `license=MIT`

### Getting Your API Key

1. Visit: https://testnet.arcscan.app
2. Look for:
   - Account/Profile section
   - API Keys section
   - Developer settings
3. Create a new API key
4. Copy it to your `.env` file as `ARCSCAN_API_KEY`

### Using Foundry Verify (Easiest)

Foundry handles the API call automatically:

```bash
forge verify-contract \
  0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73 \
  src/ReputationCredit.sol:ReputationCredit \
  --chain-id 5042002 \
  --rpc-url https://rpc.testnet.arc.network \
  --verifier-url https://testnet.arcscan.app/api \
  --verifier etherscan \
  --etherscan-api-key YOUR_API_KEY
```

### Manual API Call (If Needed)

If you need to verify manually via curl:

```bash
curl -X POST "https://testnet.arcscan.app/api" \
  -d "module=contract" \
  -d "action=verifysourcecode" \
  -d "apikey=YOUR_API_KEY" \
  -d "contractaddress=0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73" \
  -d "sourceCode=YOUR_SOURCE_CODE" \
  -d "codeformat=solidity-single-file" \
  -d "contractname=ReputationCredit" \
  -d "compilerversion=v0.8.20+commit.a1b79de6" \
  -d "optimizationUsed=1" \
  -d "runs=200" \
  -d "license=MIT"
```

### Check Verification Status

**GET** `/api`
**Parameters:**
- `module=contract`
- `action=getsourcecode`
- `address=CONTRACT_ADDRESS`
- `apikey=YOUR_API_KEY`

This will show if the contract is verified and return the source code.

---

## 🎯 Quick Steps

1. **Get API Key**: Visit https://testnet.arcscan.app and find API keys section
2. **Add to .env**: `ARCSCAN_API_KEY="your-key"`
3. **Run verification script**: `.\verify-contract.ps1`

---

## 📋 Alternative: Use Cast Without Verification

Remember: **You don't need verification to use the contract!**

Your frontend and cast commands work perfectly without verification.

Verification is just for:
- ✅ Reading code on explorer
- ✅ Using ArcScan UI
- ✅ Better documentation

Your protocol works fine as-is! 🚀

