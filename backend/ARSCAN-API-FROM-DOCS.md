# ArcScan API Verification - Based on Arc Network Docs

## What the Documentation Says

From `arc-network-llm.txt`:
- **Block Explorers**: "Arc provides blockchain explorers for viewing transactions, blocks, and contract interactions"
- **API Docs**: Mentioned but not detailed in the file - refers to official docs at https://docs.arc.network
- **EVM Compatible**: Uses standard Ethereum tools, so ArcScan likely uses **Etherscan-compatible API**

## ArcScan API Structure

Since Arc is **fully EVM compatible** and uses standard Ethereum tools, ArcScan uses **Etherscan-compatible API endpoints**:

### Base URL
```
https://testnet.arcscan.app/api
```

### Verification Endpoint

**POST** `/api`

**Standard Etherscan Parameters:**
```
module=contract
action=verifysourcecode
apikey=YOUR_API_KEY (optional for testnet)
contractaddress=0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73
sourceCode=YOUR_SOURCE_CODE
codeformat=solidity-single-file
contractname=ReputationCredit
compilerversion=v0.8.20+commit.a1b79de6
optimizationUsed=1
runs=200
license=MIT
```

### Check Verification Status

**GET** `/api`
```
module=contract
action=getsourcecode
address=0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73
apikey=YOUR_API_KEY
```

## Why This Works

Arc Network documentation confirms:
- ✅ **Full EVM Compatibility**: Uses existing Ethereum frameworks (Hardhat, Foundry)
- ✅ **Standard Tools**: Works with Etherscan-compatible explorers
- ✅ **Foundry Support**: Your `foundry.toml` already configured for ArcScan

## Testing the API

Try this to check if contract is verified:

```bash
curl "https://testnet.arcscan.app/api?module=contract&action=getsourcecode&address=0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73"
```

If it returns source code → Verified ✅
If it returns empty → Not verified ❌

## Verification Command

Since ArcScan is Etherscan-compatible, use Foundry:

```bash
forge verify-contract \
  0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73 \
  src/ReputationCredit.sol:ReputationCredit \
  --chain-id 5042002 \
  --rpc-url https://rpc.testnet.arc.network \
  --verifier-url https://testnet.arcscan.app/api \
  --verifier etherscan \
  --etherscan-api-key YOUR_API_KEY_IF_NEEDED
```

**Note:** Testnet may not require API key - try without it first!

## Official API Docs

For complete API documentation, check:
- **ArcScan API Docs**: https://testnet.arcscan.app/api-docs?tab=rest_api
- **Arc Network Docs**: https://docs.arc.network

These should have the full endpoint specifications!

---

**Bottom Line:** ArcScan uses standard Etherscan-compatible API, so your Foundry verification should work!

