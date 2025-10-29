# Arc Microcredit Protocol

A decentralized microcredit platform on Arc Testnet that lets people build credit scores and get instant loans based on their reputation.

## What This Does

Imagine a credit system where anyone can start building their reputation from scratch. You create a profile, request a loan, and as you repay it, your credit score improves. Better credit scores mean better interest rates and higher loan limits.

The system automatically approves loans based on your credit score, mints USDC directly to your wallet, and tracks everything on-chain. No traditional banks, no credit checks, just transparent blockchain-based lending.

## How It Works

- **Create Your Profile**: Start with a default credit score of 500
- **Request Loans**: Get instantly approved loans based on your reputation (100-10,000 USDC)
- **Repay & Build Credit**: Every successful repayment improves your score
- **Better Rates Over Time**: Higher scores unlock lower interest rates (5%-20%)

## Project Structure

- `backend/` - Smart contracts written in Solidity (Foundry)
- `frontend/` - Web interface built with Next.js and Wagmi

## Getting Started

### Backend

1. Install Foundry (if you haven't):
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. Set up your environment:
   ```bash
   cd backend
   cp env.example .env
   # Edit .env with your private key
   ```

3. Build and deploy:
   ```bash
   forge build
   node deploy.js
   ```

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Configure:
   ```bash
   cp env.example .env.local
   # Add your contract address from the deployment
   ```

3. Run:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` and connect your wallet to start using the protocol.

## Key Contracts

- **ProtocolUSDC**: The token used for loans. Can be minted by the protocol, and users can exchange ARC USDC for ProtocolUSDC at a 1:500 rate.
- **ReputationCredit**: The main protocol that handles credit profiles, loan requests, and repayments.

## Network

Deployed on **Arc Testnet**:
- RPC: `https://rpc.testnet.arc.network`
- Explorer: `https://testnet.arcscan.app`
- Chain ID: `5042002`

## Features

✅ Decentralized profile creation (no admin needed)  
✅ Auto-approved loans based on credit score  
✅ Transparent interest rates  
✅ Repayment history tracked on-chain  
✅ Credit score updates automatically  
✅ Direct USDC minting to borrowers  

## Tech Stack

- **Smart Contracts**: Solidity 0.8.20, Foundry
- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Web3**: Wagmi, Viem
- **Network**: Arc Testnet

## License

MIT
