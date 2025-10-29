# Redeploy Contract Guide

The contract needs to be redeployed because we added new decentralized `createCreditProfile()` functions.

## Quick Redeploy Steps

### 1. Build the Contract
```bash
cd G:\Arc-Microcredit-Protocol\backend
forge build
```

### 2. Deploy to Arc Testnet
```bash
# Load environment variables
source .env  # or in PowerShell: Get-Content .env | ForEach-Object { ... }

# Deploy
forge script script/DeployReputationCredit.s.sol:DeployReputationCredit \
  --rpc-url $ARC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ARCSCAN_API_KEY
```

### 3. Update Frontend Contract Address
After deployment, update `G:\Arc-Microcredit-Protocol\frontend\.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..." # New contract address
```

### 4. Restart Frontend
```bash
cd G:\Arc-Microcredit-Protocol\frontend
npm run dev
```

## New Functions Available

After redeploy, users can:
- `createCreditProfile()` - Creates profile with default score of 500
- `createCreditProfile(uint256 initialScore)` - Creates profile with custom score

No admin approval needed! 🎉

## Alternative: Use Old Contract Temporarily

If you can't redeploy right now, you can create profiles via ArcScan:
1. Go to: https://testnet.arcscan.app/address/0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73#writeContract
2. Connect wallet (as owner/admin)
3. Call `createCreditProfile(address, uint256)` with:
   - User address: Your wallet address
   - Initial score: 500

But this defeats the purpose of decentralization, so redeploying is recommended.

