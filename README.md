# Arc Microcredit Protocol

Build credit and get loans on the blockchain. Start from scratch, repay loans, improve your score, and unlock better rates.

## The Idea

Traditional banks won't give you a loan without credit history. This fixes that. Create a profile, request a loan, repay it, and watch your credit score grow. Higher score = lower interest rates.

Everything runs on smart contracts. No middleman, no approval process. If you qualify, you get the loan instantly.

## Quick Start

**Backend:**
```bash
cd backend
cp env.example .env
# Add your private key to .env
forge build
node deploy.js
```

**Frontend:**
```bash
cd frontend
npm install
cp env.example .env.local
# Add your contract address to .env.local
npm run dev
```

Visit `http://localhost:3000` and connect your wallet.

## What's Inside

- **ReputationCredit.sol** - Main contract that handles profiles, loans, and repayments
- **ProtocolUSDC.sol** - Token used for lending (mints to borrowers automatically)

Built on **Arc Testnet**. Uses Solidity, Foundry, Next.js, and Wagmi.
