#!/bin/bash
# Script to copy contract ABI from backend to frontend

BACKEND_DIR="G:\\Arc-Microcredit-Protocol\\backend"
FRONTEND_DIR="G:\\Arc-Microcredit-Protocol\\frontend"
ABI_SOURCE="$BACKEND_DIR\\out\\ReputationCredit.sol\\ReputationCredit.json"
ABI_DEST="$FRONTEND_DIR\\lib\\contract-abi.json"

echo "Copying contract ABI from backend to frontend..."

if [ ! -f "$ABI_SOURCE" ]; then
    echo "Error: Contract ABI not found at $ABI_SOURCE"
    echo "Please run 'forge build' in the backend directory first."
    exit 1
fi

# Extract just the ABI from the JSON file
if command -v node &> /dev/null; then
    node -e "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('$ABI_SOURCE', 'utf8')); fs.writeFileSync('$ABI_DEST', JSON.stringify(data.abi, null, 2));"
    echo "ABI copied successfully to $ABI_DEST"
else
    echo "Node.js not found. Please copy the ABI manually from:"
    echo "  Source: $ABI_SOURCE"
    echo "  Destination: $ABI_DEST"
fi

