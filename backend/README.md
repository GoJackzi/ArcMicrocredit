# ReputationCredit Protocol - Backend

A reputation-based microcredit protocol built for Arc Testnet using Foundry.

## Overview

The ReputationCredit protocol enables users to build credit scores and access loans based on their reputation and repayment history. It's designed specifically for Arc Testnet with USDC as the native gas token.

## Features

- **Credit Scoring System**: 0-1000 scale based on repayment history and reputation
- **Dynamic Interest Rates**: Lower rates for higher credit scores
- **Loan Limits**: Based on credit score (100 USDC to 10,000 USDC)
- **Reputation Points**: Additional scoring mechanism for good behavior
- **Real-time Updates**: Credit scores update automatically after repayments

## Contract Functions

### Core Functions
- `createCreditProfile(address user, uint256 initialScore)` - Create new credit profile
- `getCreditScore(address user)` - Get current credit score
- `getLoanLimit(address user)` - Get maximum loan amount
- `requestLoan(uint256 amount, uint256 termDays)` - Request a loan
- `approveLoan(address borrower, uint256 loanId)` - Approve a loan
- `repayLoan(uint256 loanId)` - Repay a loan

### Admin Functions
- `addReputationPoints(address user, uint256 points, string reason)` - Add reputation points
- `addAuthorizedLender(address lender)` - Add authorized lender
- `updateInterestRates(uint256 baseRate, uint256 maxRate, uint256 minRate)` - Update rates

## Setup

1. **Install Foundry** (if not already installed):
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Clone and setup**:
   ```bash
   cd G:\Arc-Microcredit-Protocol\backend
   ```

3. **Create environment file**:
   ```bash
   cp env.example .env
   # Edit .env with your private key and RPC URL
   ```

4. **Install dependencies**:
   ```bash
   forge install
   ```

## Development

### Build
```bash
forge build
```

### Test
```bash
forge test
```

### Deploy
```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Manual Deployment
```bash
forge script script/DeployReputationCredit.s.sol:DeployReputationCredit \
  --rpc-url $ARC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

## Configuration

### Interest Rates
- **Base Rate**: 5% (500 basis points)
- **Excellent Score (800+)**: 5%
- **Good Score (600-799)**: 7%
- **Fair Score (400-599)**: 10%
- **Poor Score (200-399)**: 15%
- **Very Poor (<200)**: 20%

### Loan Limits
- **Excellent Score**: 10,000 USDC
- **Good Score**: 7,000 USDC
- **Fair Score**: 5,000 USDC
- **Poor Score**: 3,000 USDC
- **Very Poor**: 100 USDC

## Network Details

- **Network**: Arc Testnet
- **RPC URL**: https://rpc.testnet.arc.network
- **Chain ID**: 5042002
- **Gas Token**: USDC (6 decimals)
- **Explorer**: https://testnet.arcscan.app

## Contract ABI

After deployment, the contract ABI will be available at:
`out/ReputationCredit.sol/ReputationCredit.json`

This ABI is used by the frontend to interact with the deployed contract.

## Testing

The test suite covers:
- Credit profile creation
- Loan requests and approvals
- Loan repayments
- Credit score updates
- Reputation points
- Protocol statistics
- Error conditions

Run tests with:
```bash
forge test -vvv
```

## Security

- Only owner can create credit profiles
- Only authorized lenders can approve loans
- Loan amounts are validated against credit limits
- Interest rates are calculated based on credit scores
- All state changes emit events for transparency

## License

MIT License

