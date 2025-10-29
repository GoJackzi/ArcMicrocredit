# Windows Setup Guide for Dynamic Server Wallets

## ⚠️ Platform Limitation

Dynamic's Node SDK requires Linux or macOS. Since you're on Windows, use one of these methods:

## ✅ Method 1: Create Wallets via Dashboard (Recommended)

### Steps:

1. **Open Dynamic Dashboard**
   - Go to: https://app.dynamic.xyz
   - Login with your account

2. **Navigate to Server Wallets**
   - Select your environment: `136a7961-aad7-4da6-910c-321e26dcb130`
   - Go to "Server Wallets" section

3. **Create Admin Wallet**
   - Click "Create Wallet" or "New Server Wallet"
   - Settings:
     - Threshold Scheme: `TWO_OF_TWO`
     - Chain: EVM
     - Back up to client share service: No (unchecked)
   - Copy the **Wallet ID** and **Address**

4. **Create Lender Wallet**
   - Repeat step 3 for the lender wallet
   - Copy the **Wallet ID** and **Address**

5. **Update `.env` File**
   ```bash
   cd G:\Arc-Microcredit-Protocol\backend\services
   ```
   
   Edit `.env` and add:
   ```env
   DYNAMIC_ADMIN_WALLET_ID="<admin-wallet-id-from-dashboard>"
   DYNAMIC_LENDER_WALLET_ID="<lender-wallet-id-from-dashboard>"
   ```

## ✅ Method 2: Use WSL (Windows Subsystem for Linux)

### Install Node.js in WSL:

```bash
# Open WSL terminal
wsl

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Run Setup in WSL:

```bash
# Navigate to project
cd /mnt/g/Arc-Microcredit-Protocol/backend/services

# Install dependencies
npm install --legacy-peer-deps

# Run setup
npm run setup
```

The script will create wallets and display their IDs.

## ✅ Method 3: Use Docker or Linux Server

Run the setup script on a Linux machine or Docker container with Node.js installed.

## 📋 After Wallet Creation

### 1. Fund the Wallets

Send USDC to both wallet addresses for gas fees:
- Admin wallet address
- Lender wallet address

### 2. Authorize Lender Wallet

Add the lender wallet address as an authorized lender in the contract:

```bash
cd G:\Arc-Microcredit-Protocol\backend

# Using cast (from Foundry) via WSL
wsl bash -c "cd /mnt/g/Arc-Microcredit-Protocol/backend && \
  cast send 0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73 \
  'addAuthorizedLender(address)' <LENDER_ADDRESS> \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key <PRIVATE_KEY>"
```

### 3. Test the Services

**Create a credit profile:**
```bash
cd G:\Arc-Microcredit-Protocol\backend\services
npm run create-profile 0xUserAddress 750
```

**Start automated loan approval:**
```bash
npm run approve-loans
```

## 📝 Current Configuration

- ✅ Environment ID: `136a7961-aad7-4da6-910c-321e26dcb130`
- ✅ API Token: Configured
- ✅ Contract Address: `0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73`
- ⏳ Wallet IDs: Need to be created (see methods above)

## 💡 Recommended Approach

For Windows users, **Method 1 (Dashboard)** is the easiest and fastest way to get started.

