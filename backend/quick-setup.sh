# Quick Setup Script - Just Run This!

# This script will help you authorize your wallet and verify the contract
# Run it with: bash quick-setup.sh YOUR_WALLET_ADDRESS

if [ -z "$1" ]; then
  echo "❌ Error: Please provide your wallet address"
  echo "Usage: bash quick-setup.sh YOUR_WALLET_ADDRESS"
  echo "Example: bash quick-setup.sh 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  exit 1
fi

YOUR_WALLET=$1
CONTRACT="0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73"
RPC_URL="https://rpc.testnet.arc.network"

echo "🚀 Quick Setup - Arc Microcredit Protocol"
echo "=========================================="
echo ""
echo "Contract: $CONTRACT"
echo "Your Wallet: $YOUR_WALLET"
echo ""

# Load .env if exists
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "⚠️  No .env file found. Creating one..."
  echo "ARC_TESTNET_RPC_URL=$RPC_URL" > .env
  echo "PRIVATE_KEY=0x..." >> .env
  echo "Please edit .env and add your PRIVATE_KEY"
  exit 1
fi

if [ -z "$PRIVATE_KEY" ] || [ "$PRIVATE_KEY" = "0x..." ]; then
  echo "❌ Error: PRIVATE_KEY not set in .env"
  echo "Please edit .env and add your PRIVATE_KEY"
  exit 1
fi

echo "✅ Step 1: Authorizing your wallet as lender..."
cast send $CONTRACT \
  "addAuthorizedLender(address)" $YOUR_WALLET \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY

echo ""
echo "✅ Step 2: Verifying contract (may take a minute)..."
forge verify-contract \
  $CONTRACT \
  src/ReputationCredit.sol:ReputationCredit \
  --chain-id 5042002 \
  --rpc-url $RPC_URL \
  --verifier-url https://testnet.arcscan.app/api \
  --verifier etherscan \
  --etherscan-api-key "${ARCSCAN_API_KEY:-}" 2>&1 || echo "⚠️  Verification skipped (API key may not be needed)"

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 What you can do now:"
echo "  1. Create profiles: cast send $CONTRACT \"createCreditProfile(address,uint256)\" USER_ADDRESS 750 --rpc-url $RPC_URL --private-key \$PRIVATE_KEY"
echo "  2. Approve loans: cast send $CONTRACT \"approveLoan(address,uint256)\" BORROWER_ADDRESS 0 --rpc-url $RPC_URL --private-key \$PRIVATE_KEY"
echo "  3. Test frontend: cd ../frontend && npm run dev"
echo ""
echo "🌐 Contract: https://testnet.arcscan.app/address/$CONTRACT"

