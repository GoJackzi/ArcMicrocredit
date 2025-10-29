# Regular Wallet Setup Script

# This script helps you authorize your wallet and test the protocol
# Run this after updating YOUR_WALLET_ADDRESS below

YOUR_WALLET_ADDRESS="0x..." # Replace with your wallet address
CONTRACT_ADDRESS="0xa8d7b887B046fbd51a4d2E870c99F1b86CC6de73"
RPC_URL="https://rpc.testnet.arc.network"

echo "🚀 Arc Microcredit Protocol - Regular Wallet Setup"
echo "=================================================="
echo ""
echo "Contract Address: $CONTRACT_ADDRESS"
echo "Your Wallet: $YOUR_WALLET_ADDRESS"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Authorize your wallet as lender:"
echo "   cast send $CONTRACT_ADDRESS \\"
echo "     \"addAuthorizedLender(address)\" $YOUR_WALLET_ADDRESS \\"
echo "     --rpc-url $RPC_URL \\"
echo "     --private-key YOUR_PRIVATE_KEY"
echo ""
echo "2. Test creating a profile:"
echo "   cast send $CONTRACT_ADDRESS \\"
echo "     \"createCreditProfile(address,uint256)\" USER_ADDRESS 750 \\"
echo "     --rpc-url $RPC_URL \\"
echo "     --private-key YOUR_PRIVATE_KEY"
echo ""
echo "3. Or use MetaMask + ArcScan Explorer:"
echo "   https://testnet.arcscan.app/address/$CONTRACT_ADDRESS#writeContract"
echo ""
echo "✅ Setup complete! Your wallet can now manage the protocol."

