# Dynamic Integration Services

Automated backend services for the ReputationCredit protocol using Dynamic server wallets.

## Features

- **Automated Loan Approval**: Automatically approves pending loans using Dynamic server wallets
- **Profile Creation**: Create credit profiles for users using admin wallet
- **Secure MPC Wallets**: Uses Dynamic's Multi-Party Computation (MPC) for secure signing

## Setup

### 1. Install Dependencies

```bash
cd G:\Arc-Microcredit-Protocol\backend\services
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and configure:

```bash
cd G:\Arc-Microcredit-Protocol\backend
cp env.example .env
```

Required variables:
- `DYNAMIC_ENVIRONMENT_ID` - Get from Dynamic Dashboard
- `DYNAMIC_API_TOKEN` - Create API token in Dynamic Dashboard
- `REPUTATION_CREDIT_CONTRACT_ADDRESS` - Deployed contract address
- `DYNAMIC_ADMIN_WALLET_ID` - Admin server wallet ID (created via setup)
- `DYNAMIC_LENDER_WALLET_ID` - Lender server wallet ID (created via setup)

### 3. Create Server Wallets

First, create the server wallets using a setup script:

```javascript
// setup-wallets.js
import { createAuthenticatedClient, createServerWallet } from './src/dynamic-client.js'

const client = await createAuthenticatedClient()

// Create admin wallet
const adminWallet = await createServerWallet(client)
console.log('Admin Wallet ID:', adminWallet.walletId)

// Create lender wallet
const lenderWallet = await createServerWallet(client)
console.log('Lender Wallet ID:', lenderWallet.walletId)

// Save the wallet IDs to your .env file
```

### 4. Authorize Wallets in Contract

Add the server wallet addresses as authorized lenders in the ReputationCredit contract:

```solidity
// Call addAuthorizedLender for the lender wallet address
reputationCredit.addAuthorizedLender(lenderWalletAddress)
```

## Usage

### Create Credit Profile

```bash
npm run create-profile <userAddress> [initialScore]
```

Example:
```bash
npm run create-profile 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 750
```

### Automated Loan Approval

Start the monitoring service that automatically approves pending loans:

```bash
npm run approve-loans
```

This service:
- Polls for pending loan requests
- Automatically approves loans using the lender server wallet
- Runs continuously until stopped

### Monitor Loans

Check loan status:

```bash
npm run monitor-loans
```

## Architecture

```
┌─────────────────┐
│  ReputationCredit│
│     Contract     │
└────────┬─────────┘
         │
         │ approveLoan()
         │ createCreditProfile()
         │
┌────────▼─────────┐
│ Dynamic Services │
│   (Node.js)      │
└────────┬─────────┘
         │
         │ Server Wallets
         │ (MPC)
         │
┌────────▼─────────┐
│  Dynamic MPC     │
│  Infrastructure  │
└──────────────────┘
```

## Security Notes

- Server wallets use `TWO_OF_TWO` threshold signature scheme by default
- Wallet key shares are secured through Dynamic's MPC infrastructure
- All transactions are signed server-side with no private key exposure
- Wallets can be backed up using `externalServerKeyShares`

## Development

### Project Structure

```
services/
├── src/
│   ├── dynamic-client.js      # Dynamic SDK client setup
│   ├── contract-interaction.js # Contract interaction utilities
│   ├── approve-loans.js        # Automated loan approval service
│   ├── create-profile.js       # Profile creation service
│   └── config/
│       └── chains.js           # Chain configuration
├── package.json
└── README.md
```

## API Reference

### Dynamic Client

```javascript
import { createAuthenticatedClient, createServerWallet } from './src/dynamic-client.js'

// Create authenticated client
const client = await createAuthenticatedClient()

// Create new wallet
const wallet = await createServerWallet(client)

// Get existing wallet
const wallet = await getWallet(client, walletId)
```

### Contract Interaction

```javascript
import { createCreditProfile, approveLoan } from './src/contract-interaction.js'

// Create profile
await createCreditProfile({
  walletClient,
  contractAddress,
  userAddress,
  initialScore: 750,
})

// Approve loan
await approveLoan({
  walletClient,
  contractAddress,
  borrowerAddress,
  loanId: 0,
})
```

## Troubleshooting

### Wallet Not Found
- Ensure wallet IDs in `.env` match those created in Dynamic Dashboard
- Check that wallets were created in the correct environment

### Transaction Failures
- Verify wallet addresses are authorized in the contract
- Check wallet has sufficient USDC for gas fees
- Ensure contract address is correct

### Authentication Errors
- Verify `DYNAMIC_API_TOKEN` is valid
- Check `DYNAMIC_ENVIRONMENT_ID` matches your dashboard
- Ensure API token has necessary permissions

## Next Steps

1. Set up webhook endpoints for real-time loan request notifications
2. Add database persistence for loan history
3. Implement automated reputation point updates
4. Add monitoring and alerting for failed transactions

