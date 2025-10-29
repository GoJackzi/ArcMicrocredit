# Dynamic Dashboard Navigation Guide

## 🎯 Where to Look for Server Wallets

Based on your dashboard screenshot, here's where to check:

### Step 1: Look in the WALLETS Section

In the **left sidebar**, click on **"WALLETS"** (it's collapsed in your screenshot). Then check:

1. **"Wallet Management"** ← **Check this first!**
   - This MIGHT have server wallet options
   - Click here and look for:
     - "Server Wallets"
     - "Create Wallet"
     - "Add Wallet"
     - Any option mentioning "server" or "backend"

2. **"Embedded Wallets"**
   - This is for user-facing wallets (probably not what you need)
   - But check it anyway, just in case

3. **"Global Wallets"**
   - This might have server wallet options
   - Worth checking

### Step 2: Check Developers Section

If WALLETS doesn't have it, check:

1. **"DEVELOPERS"** → **"API Keys"**
   - This shows your API credentials
   - Server wallets are created via API, so this is relevant

2. **"DEVELOPERS"** → **"Webhooks"**
   - Not directly related, but worth checking

### Step 3: What to Look For

When you click on "Wallet Management" or "Global Wallets", look for:
- ✅ "Create Server Wallet" button
- ✅ "New Wallet" or "+" button
- ✅ "Add Wallet" option
- ✅ "Server Wallets" tab or section
- ✅ Any mention of "MPC" or "Multi-Party Computation"

### Step 4: If You Find It

If you find a way to create wallets:
1. Click "Create Wallet" or similar
2. Select:
   - **Type**: Server Wallet (or MPC Wallet)
   - **Threshold Scheme**: TWO_OF_TWO
   - **Chain**: EVM
   - **Back up to client share**: No (unchecked)
3. Copy the **Wallet ID** and **Address** immediately
4. Save them to your `.env` file

### Step 5: If You DON'T Find It

**This is expected!** Server wallets are typically created via code, not UI.

In that case:
1. ✅ Use your regular wallet instead (see SIMPLIFIED-WALLET-SETUP.md)
2. ✅ Or set up WSL to run the Node SDK
3. ✅ Your protocol works fine without server wallets!

## 📋 Quick Checklist

- [ ] Click "WALLETS" in left sidebar
- [ ] Check "Wallet Management" 
- [ ] Check "Global Wallets"
- [ ] Look for "Create" or "Add" buttons
- [ ] If found → Create wallets and save IDs
- [ ] If NOT found → Use regular wallet (it's fine!)

## 🎯 Most Likely Outcome

**99% chance**: You won't find server wallet creation in the dashboard UI.

**Why?** Server wallets are designed to be created programmatically via the Node SDK for security and automation purposes.

**Solution**: Use your regular wallet for now, add automation later if needed!

---

**Need help?** Let me know what you see when you click "Wallet Management"!

