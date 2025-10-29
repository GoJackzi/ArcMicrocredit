# Simple Wallet Setup Guide

## ⚠️ Important Reality Check

**Dynamic Server Wallets CANNOT be created via the Dashboard.** They can ONLY be created using the Node.js SDK, which requires Linux or macOS.

Since you're on Windows, here are your REAL options:

## ✅ Option 1: Skip Server Wallets (For Now) - RECOMMENDED

You can run your protocol **without Dynamic server wallets** initially:

### What You'll Lose:
- Automated loan approvals
- Automated profile creation

### What You Can Still Do:
- Manually approve loans using your own wallet
- Manually create profiles using contract owner functions
- Test the full frontend and contract functionality

### How to Use It:
1. Use your regular wallet (MetaMask, etc.) as the contract owner
2. Call `addAuthorizedLender(yourWalletAddress)` to authorize yourself
3. Manually approve loans by calling `approveLoan(borrower, loanId)` from your wallet
4. Manually create profiles by calling `createCreditProfile(user, score)` from your wallet

**This lets you test everything NOW without waiting for server wallet setup!**

---

## ✅ Option 2: Use WSL (Windows Subsystem for Linux)

If you want automated server wallets:

### Quick Setup:

1. **Install WSL** (if not already installed):
   ```powershell
   wsl --install
   ```
   Restart your computer after installation.

2. **Open WSL terminal** (Windows key, type "Ubuntu" or "WSL")

3. **Install Node.js in WSL**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Navigate to your project**:
   ```bash
   cd /mnt/g/Arc-Microcredit-Protocol/backend/services
   ```

5. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

6. **Copy your .env file** (if you have one):
   ```bash
   # The .env file should already be accessible from Windows
   # Just make sure it has DYNAMIC_ENVIRONMENT_ID and DYNAMIC_API_TOKEN
   ```

7. **Run the setup**:
   ```bash
   npm run setup
   ```

This will create your server wallets and print the wallet IDs!

---

## ✅ Option 3: Use Docker (Advanced)

Run the setup in a Linux container:

```bash
docker run -it --rm -v G:\Arc-Microcredit-Protocol:/workspace -w /workspace/backend/services node:20 bash
npm install --legacy-peer-deps
npm run setup
```

---

## 🎯 My Recommendation

**Start with Option 1** - skip server wallets for now. You can:
- ✅ Test the entire frontend
- ✅ Test all contract functions
- ✅ Deploy and use the protocol
- ✅ Add automation later when convenient

Then when you have time, set up WSL (Option 2) to add automation.

---

## 📋 If You Choose Option 1 (Manual Mode)

### Step 1: Deploy Contract (Already Done ✅)
Contract is at: `0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73`

### Step 2: Use Your Wallet as Admin

Instead of server wallets, use your own wallet:

```bash
# In WSL or using cast directly
cast send 0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73 \
  "addAuthorizedLender(address)" YOUR_WALLET_ADDRESS \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key YOUR_PRIVATE_KEY
```

Now YOUR wallet can:
- Approve loans manually
- Create credit profiles manually

### Step 3: Test the Frontend

1. Connect your wallet to the frontend
2. Request loans (they'll show as pending)
3. Switch to your admin wallet
4. Manually approve the loan
5. User can now repay

This works perfectly for testing and small-scale use!

---

## 🤔 Still Confused?

The bottom line:
- **Server Wallets = Requires Linux/Mac**
- **Dashboard = No UI for server wallets**
- **Solution = Use your regular wallet OR set up WSL**

Choose what works for you now, add automation later! 🚀

