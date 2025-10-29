# Quick Compile & Deploy Guide

Since forge isn't available, here's the fastest way to compile and deploy:

## Option 1: Use Remix IDE (Easiest - ~5 minutes)

1. Go to https://remix.ethereum.org
2. Create files:
   - `ProtocolUSDC.sol` (copy from `G:\Arc-Microcredit-Protocol\backend\src\ProtocolUSDC.sol`)
   - `ReputationCredit.sol` (copy from `G:\Arc-Microcredit-Protocol\backend\src\ReputationCredit.sol`)
3. Select compiler version **0.8.20**
4. Enable optimization: **200 runs**
5. Compile both contracts
6. Copy bytecode and ABI to `out/ProtocolUSDC.sol/ProtocolUSDC.json` and `out/ReputationCredit.sol/ReputationCredit.json`
7. Then run: `node deploy.js`

## Option 2: Install Foundry on WSL (~10 minutes)

```bash
# In WSL terminal
curl -L https://foundry.paradigm.xyz | bash
foundryup
cd /mnt/g/Arc-Microcredit-Protocol/backend
forge build
```

Then run: `node deploy.js`

## Option 3: Use GitHub Codespaces

1. Create a GitHub repo
2. Open in Codespaces
3. Run: `forge build`
4. Download artifacts, then deploy

---

**After compilation, run:**
```bash
cd G:\Arc-Microcredit-Protocol\backend
node deploy.js
```

