import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const RPC_URL = process.env.ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error('❌ PRIVATE_KEY not found in .env');
  process.exit(1);
}

// Contract addresses from deployment
const PROTOCOL_USDC_ADDRESS = '0x01AfA19Bfc9b1d59F2AA0065443F632A4ee38855';
const REPUTATION_CREDIT_ADDRESS = '0x52B117a6ab623a9Aab3eb7Dc47db82B1D9c17f29';

async function fixProtocolContract() {
  console.log('🔧 Fixing ProtocolUSDC protocolContract setting\n');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log('📡 Connected to:', (await provider.getNetwork()).name);
  console.log('👤 Wallet:', wallet.address);

  // ProtocolUSDC ABI for the functions we need
  const protocolUSDCAbi = [
    'function protocolContract() external view returns (address)',
    'function setProtocolContract(address _protocolContract) external'
  ];

  const protocolUSDC = new ethers.Contract(PROTOCOL_USDC_ADDRESS, protocolUSDCAbi, wallet);

  // Check current value
  console.log('\n📋 Checking current protocolContract value...');
  const currentProtocol = await protocolUSDC.protocolContract();
  console.log('Current protocolContract:', currentProtocol);
  console.log('Expected protocolContract:', REPUTATION_CREDIT_ADDRESS);

  if (currentProtocol.toLowerCase() === REPUTATION_CREDIT_ADDRESS.toLowerCase()) {
    console.log('\n✅ protocolContract is already set correctly!');
    console.log('The issue might be something else. Let me check if ReputationCredit can call mint...\n');
    
    // Check if ReputationCredit has the correct USDC address
    const reputationCreditAbi = [
      'function usdcToken() external view returns (address)'
    ];
    const reputationCredit = new ethers.Contract(REPUTATION_CREDIT_ADDRESS, reputationCreditAbi, provider);
    const usdcAddress = await reputationCredit.usdcToken();
    console.log('ReputationCredit.usdcToken():', usdcAddress);
    
    if (usdcAddress.toLowerCase() !== PROTOCOL_USDC_ADDRESS.toLowerCase()) {
      console.log('⚠️  MISMATCH: ReputationCredit points to different USDC address!');
      console.log('This could be the issue.');
    } else {
      console.log('✅ ReputationCredit points to correct ProtocolUSDC address');
    }
    
    return;
  }

  // Check if we can set it (must be deployer or current protocolContract)
  console.log('\n🔧 Attempting to update protocolContract...');
  
  try {
    const tx = await protocolUSDC.setProtocolContract(REPUTATION_CREDIT_ADDRESS);
    console.log('⏳ Transaction sent:', tx.hash);
    console.log('   Waiting for confirmation...');
    
    await tx.wait();
    
    // Verify it was set
    const newProtocol = await protocolUSDC.protocolContract();
    console.log('\n✅ protocolContract updated successfully!');
    console.log('New protocolContract:', newProtocol);
    
    if (newProtocol.toLowerCase() === REPUTATION_CREDIT_ADDRESS.toLowerCase()) {
      console.log('✅ Verified: protocolContract is now correctly set!');
      console.log('\n🎉 You can now request loans successfully!');
    } else {
      console.log('❌ Something went wrong - protocolContract not updated correctly');
    }
  } catch (error) {
    console.error('\n❌ Failed to update protocolContract:', error.message);
    
    if (error.message.includes('Unauthorized')) {
      console.log('\n⚠️  Authorization failed. The deployer address must match the current protocolContract.');
      console.log('Current protocolContract:', currentProtocol);
      console.log('Your wallet:', wallet.address);
      console.log('\n💡 Solution: You may need to call this from the address that is the current protocolContract');
      console.log('   OR the ProtocolUSDC needs to be redeployed with address(0) as initial protocolContract');
    } else {
      console.error('Full error:', error);
    }
    
    process.exit(1);
  }
}

fixProtocolContract()
  .then(() => {
    console.log('\n✅ Fix script complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fix script failed:', error);
    process.exit(1);
  });

