# Verify Contract Script

# This script verifies your deployed contract on ArcScan
# Make sure you have ARCSCAN_API_KEY in your .env file

CONTRACT_ADDRESS="0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73"
CONTRACT_NAME="ReputationCredit"
CONTRACT_PATH="src/ReputationCredit.sol:ReputationCredit"

echo "🔍 Verifying Contract on ArcScan"
echo "================================="
echo ""
echo "Contract Address: $CONTRACT_ADDRESS"
echo "Contract Name: $CONTRACT_NAME"
echo ""

# Load environment variables
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "❌ Error: .env file not found"
  exit 1
fi

if [ -z "$ARCSCAN_API_KEY" ]; then
  echo "⚠️  Warning: ARCSCAN_API_KEY not set in .env"
  echo ""
  echo "You can verify manually:"
  echo "1. Get API key from: https://testnet.arcscan.app (if available)"
  echo "2. Or verify manually via ArcScan UI"
  echo ""
  echo "Alternatively, use cast to interact with unverified contracts!"
  exit 1
fi

echo "🔨 Building contracts..."
forge build

echo ""
echo "✅ Verifying contract..."
forge verify-contract \
  $CONTRACT_ADDRESS \
  $CONTRACT_PATH \
  --chain-id 5042002 \
  --rpc-url https://rpc.testnet.arc.network \
  --verifier-url https://testnet.arcscan.app/api \
  --verifier etherscan \
  --etherscan-api-key $ARCSCAN_API_KEY

echo ""
echo "✅ Verification submitted!"
echo "🌐 Check status: https://testnet.arcscan.app/address/$CONTRACT_ADDRESS"

