# ArcScan API for Contract Verification

Based on Arc Network documentation and standard Etherscan-compatible APIs:

## ArcScan API Base URL

**Testnet:** `https://testnet.arcscan.app/api`

## Contract Verification Endpoint

ArcScan uses Etherscan-compatible API endpoints, so verification follows the standard pattern:

### POST `/api`

**Parameters:**
- `module=contract`
- `action=verifysourcecode` (or `verifysourcecode`)
- `apikey=YOUR_API_KEY` (optional for testnet)
- `contractaddress=0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73`
- `sourceCode=CONTRACT_SOURCE_CODE`
- `codeformat=solidity-single-file` (or `solidity-standard-json-input`)
- `contractname=ReputationCredit`
- `compilerversion=v0.8.20+commit.a1b79de6`
- `optimizationUsed=1`
- `runs=200`
- `license=MIT`

### Check Verification Status

**GET `/api`**

**Parameters:**
- `module=contract`
- `action=getsourcecode`
- `address=0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73`
- `apikey=YOUR_API_KEY` (optional)

This returns the source code if verified, or empty if not.

## Using Foundry (Easiest)

Your `foundry.toml` is already configured:

```toml
[etherscan]
arc_testnet = { 
  key = "${ARCSCAN_API_KEY}", 
  url = "https://testnet.arcscan.app/api" 
}
```

Run:
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

## Note About API Keys

For **testnet**, ArcScan may not require an API key. Try verification without it first!

If it fails, you may need to:
1. Visit https://testnet.arcscan.app
2. Look for API key registration
3. Create a free API key

## Alternative: Manual Verification via UI

1. Go to: https://testnet.arcscan.app/address/0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73
2. Click "Verify Contract" 
3. Enter source code and compiler settings
4. Submit

---

**Remember:** Verification is optional! Your contract works perfectly without it.

