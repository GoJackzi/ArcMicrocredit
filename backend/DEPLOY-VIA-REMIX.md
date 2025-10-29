# Deploy via Remix IDE (Easiest Method)

Since Foundry isn't installed, Remix IDE is the fastest way to deploy!

## Steps

### 1. Open Remix IDE
Go to: https://remix.ethereum.org

### 2. Setup Contract
- Click **"+ Create new file"**
- Name it: `ReputationCredit.sol`
- Copy the **entire content** from `G:\Arc-Microcredit-Protocol\backend\src\ReputationCredit.sol`
- Paste into Remix

### 3. Configure Compiler
- Go to **"Solidity Compiler"** tab (on left sidebar)
- Select compiler version: **0.8.20** (or latest 0.8.x)
- Click **"Compile ReputationCredit.sol"**
- ✅ Should show green checkmark if successful

### 4. Setup MetaMask for Arc Testnet
If not already configured:
- Network Name: `Arc Testnet`
- RPC URL: `https://rpc.testnet.arc.network`
- Chain ID: `5042002`
- Currency Symbol: `USDC`
- Block Explorer: `https://testnet.arcscan.app`

### 5. Deploy Contract
- Go to **"Deploy & Run Transactions"** tab
- Environment: Select **"Injected Provider - MetaMask"**
- Connect your MetaMask wallet (make sure you're on Arc Testnet!)
- Click **"Deploy"**
- Confirm transaction in MetaMask
- ⏳ Wait for deployment to complete

### 6. Get Contract Address
After deployment, you'll see:
- Contract address in Remix (copy it!)
- Transaction hash (click to view on ArcScan)

### 7. Update Frontend
1. Edit `G:\Arc-Microcredit-Protocol\frontend\.env.local` (create if doesn't exist):
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS="0x..." # Your new contract address from Remix
   NEXT_PUBLIC_ARC_RPC_URL="https://rpc.testnet.arc.network"
   ```

2. Restart frontend:
   ```powershell
   cd G:\Arc-Microcredit-Protocol\frontend
   npm run dev
   ```

### 8. Test!
1. Open: http://localhost:3000
2. Connect wallet
3. Click **"Create Credit Profile"** 
4. ✅ Should work now!

## Verification (Optional)

To verify on ArcScan:
1. Go to: https://testnet.arcscan.app/address/YOUR_CONTRACT_ADDRESS#code
2. Click **"Verify and Publish"**
3. Compiler: `0.8.20`
4. License: `MIT`
5. Optimization: `Yes` (200 runs)
6. Paste the entire contract source code
7. Click **"Verify and Publish"**

## Troubleshooting

- **"Contract creation failed"**: Make sure you have USDC for gas on Arc Testnet
- **"Compiler version mismatch"**: Use Solidity 0.8.20 or higher
- **"Cannot find library Math"**: Make sure you copied the entire file including the Math library at the bottom

---

**That's it!** Once deployed, users can create their own credit profiles without admin approval! 🎉

