# Simple Redeployment Guide

Since Foundry might not be installed on Windows, here are the easiest options:

## Option A: Install Foundry on Windows

1. **Install WSL (Windows Subsystem for Linux)** if you don't have it:
   ```powershell
   wsl --install
   ```
   Restart your computer after installation.

2. **Open WSL** and install Foundry:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

3. **Deploy from WSL**:
   ```bash
   cd /mnt/g/Arc-Microcredit-Protocol/backend
   source .env  # Manually set variables or edit in WSL
   forge build
   forge script script/DeployReputationCredit.s.sol:DeployReputationCredit \
     --rpc-url $ARC_TESTNET_RPC_URL \
     --private-key $PRIVATE_KEY \
     --broadcast \
     --verify \
     --etherscan-api-key $ARCSCAN_API_KEY \
     --verifier-url https://testnet.arcscan.app/api \
     --verifier etherscan
   ```

## Option B: Manual Deployment via ArcScan UI

If you can't install Foundry right now:

1. **Build the contract** (if you have access to a Linux/macOS machine, or use GitHub Codespaces):
   ```bash
   forge build
   ```

2. **Get the bytecode** from `out/ReputationCredit.sol/ReputationCredit.json`

3. **Deploy via ArcScan UI**:
   - Go to: https://testnet.arcscan.app/bytecode-decompiler
   - Paste the bytecode
   - Or use Remix IDE with MetaMask connection

## Option C: Use Remix IDE (Easiest for quick deployment)

1. Go to: https://remix.ethereum.org
2. Create a new file: `ReputationCredit.sol`
3. Copy the contract code from `src/ReputationCredit.sol`
4. Select compiler version 0.8.20
5. Compile the contract
6. Go to Deploy tab
7. Connect MetaMask (switch to Arc Testnet)
8. Deploy the contract
9. Copy the deployed address
10. Update frontend `.env.local` with the new address

## After Deployment

1. Update `frontend/.env.local`:
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS="0x..." # Your new contract address
   ```

2. Restart frontend:
   ```bash
   cd G:\Arc-Microcredit-Protocol\frontend
   npm run dev
   ```

3. Test the "Create Credit Profile" button!

## Quick WSL Setup (Recommended)

If you have WSL or can install it:

```bash
# In WSL terminal
cd /mnt/g/Arc-Microcredit-Protocol/backend
forge build
# Follow deployment steps above
```

This is the fastest way to get Foundry working on Windows!

