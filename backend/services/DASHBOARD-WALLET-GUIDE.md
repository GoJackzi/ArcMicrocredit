# 📘 Step-by-Step Guide: Creating Server Wallets in Dynamic Dashboard

## 🎯 Quick Overview

You need to create 2 server wallets:
1. **Admin Wallet** - For creating credit profiles
2. **Lender Wallet** - For automatically approving loans

## 📋 Detailed Steps

### Step 1: Access Dynamic Dashboard

1. Open your browser
2. Go to: **https://app.dynamic.xyz**
3. Login with your account credentials

### Step 2: Navigate to Your Environment

1. Once logged in, you should see your **environments** or **projects**
2. Click on your environment (the one with ID: `136a7961-aad7-4da6-910c-321e26dcb130`)
3. Or look for an environment selector/dropdown at the top

### Step 3: Find Server Wallets Section

Look for one of these sections in the left sidebar or main menu:
- **"Server Wallets"**
- **"Wallets" → "Server Wallets"**
- **"Settings" → "Server Wallets"**
- **"Tools" → "Server Wallets"**
- **"API" → "Server Wallets"**

If you can't find it:
- Check the "Developers" or "Developer Tools" section
- Look in "Settings" or "Configuration"
- Search in the dashboard for "server wallet" or "MPC wallet"

### Step 4: Create Admin Wallet

1. Click **"Create Wallet"** or **"New Server Wallet"** button
2. Fill in the form:
   - **Name/Label**: "Admin Wallet" or "ReputationCredit Admin"
   - **Threshold Scheme**: Select `TWO_OF_TWO`
   - **Chain**: Select `EVM` or `Ethereum`
   - **Back up to client share service**: Leave **unchecked** (No/False)
   - Any other optional fields: Leave as defaults

3. Click **"Create"** or **"Generate Wallet"**

4. **IMPORTANT**: After creation, you'll see:
   - **Wallet ID** (looks like: `wal-xxxxx` or a UUID)
   - **Address** (looks like: `0x1234...`)
   
   **Copy both immediately!**

### Step 5: Create Lender Wallet

1. Repeat Step 4, but this time:
   - **Name/Label**: "Lender Wallet" or "ReputationCredit Lender"
   - Keep all other settings the same

2. **Copy the Wallet ID and Address** for this wallet too

### Step 6: Save Wallet Information

You should have:
- **Admin Wallet ID**: `<copy-this-id>`
- **Admin Wallet Address**: `0x<copy-this-address>`
- **Lender Wallet ID**: `<copy-this-id>`
- **Lender Wallet Address**: `0x<copy-this-address>`

### Step 7: Update Your .env File

1. Open: `G:\Arc-Microcredit-Protocol\backend\services\.env`

2. Add or update these lines:
   ```env
   DYNAMIC_ADMIN_WALLET_ID="<paste-admin-wallet-id-here>"
   DYNAMIC_LENDER_WALLET_ID="<paste-lender-wallet-id-here>"
   ```

3. Save the file

### Step 8: Verify Your .env File

Open PowerShell and run:
```powershell
cd G:\Arc-Microcredit-Protocol\backend\services
Get-Content .env | Select-String "DYNAMIC"
```

You should see:
```
DYNAMIC_ENVIRONMENT_ID="136a7961-aad7-4da6-910c-321e26dcb130"
DYNAMIC_API_TOKEN="dyn_l8caMxcZuZBpq3VCBdK4pM1dpEr4eDlMXL9Pm38LxDrf7XnWF03fKuO3"
DYNAMIC_ADMIN_WALLET_ID="<your-admin-id>"
DYNAMIC_LENDER_WALLET_ID="<your-lender-id>"
```

## 🆘 Can't Find Server Wallets Section?

If you can't find "Server Wallets" in the dashboard:

1. **Check API Section**: Sometimes it's under "API Tools" or "Developer API"
2. **Look for "MPC Wallets"**: Some dashboards call them MPC wallets
3. **Check Documentation**: Go to https://www.dynamic.xyz/docs and search for "server wallets dashboard"
4. **Contact Support**: Use the help/support option in the dashboard

## 📸 What to Look For

The dashboard might show:
- A "Create" or "+" button
- A "New Wallet" option
- A form with fields like:
  - Wallet name
  - Threshold scheme dropdown
  - Chain selection
  - Backup options

## ✅ After Creating Wallets

Once you've added the wallet IDs to `.env`, the next steps are:

1. **Fund the wallets** with USDC (they need gas fees)
2. **Authorize the lender wallet** in your contract
3. **Test the services**

## 💡 Alternative: Use the API Directly

If the dashboard doesn't have a UI for server wallets, you might need to use the API. Let me know if you need help with that!

---

**Need help finding it?** Let me know what you see in your dashboard and I can guide you to the right section!

