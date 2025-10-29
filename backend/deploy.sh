#!/bin/bash

echo "🚀 ReputationCredit Protocol - Arc Testnet Deployment"
echo "====================================================="

# Load environment variables
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env not found. Please create it based on env.example."
  exit 1
fi

# Ensure Foundry is in PATH
export PATH="$HOME/.foundry/bin:$PATH"

echo "📋 Configuration:"
echo "   Wallet: $(cast wallet address --private-key $PRIVATE_KEY)"
echo "   RPC: $ARC_TESTNET_RPC_URL"
echo "   Network: Arc Testnet"

echo ""
echo "🔍 Checking wallet balance..."
WALLET_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY)
BALANCE=$(cast balance --rpc-url $ARC_TESTNET_RPC_URL $WALLET_ADDRESS)
echo "   Balance: $BALANCE wei ($(cast fromwei $BALANCE) USDC)"

echo ""
echo "🔨 Building contracts..."
forge build

echo ""
echo "🧪 Running tests..."
forge test

echo ""
echo "🚀 Deploying ReputationCredit contract..."
forge script script/DeployReputationCredit.s.sol:DeployReputationCredit \
  --rpc-url $ARC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ARCSCAN_API_KEY

echo ""
echo "✅ Deployment completed!"
echo "📄 Contract ABI available in: out/ReputationCredit.sol/ReputationCredit.json"
echo "🔗 Contract address will be displayed above"
echo "🌐 Explorer: https://testnet.arcscan.app"

