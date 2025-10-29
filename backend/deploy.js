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

async function deploy() {
  console.log('🚀 ReputationCredit Contract Deployment (with ProtocolUSDC)');
  console.log('==========================================================\n');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log('📡 Connected to:', (await provider.getNetwork()).name);
  console.log('👤 Deploying from:', wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log('💰 Balance:', ethers.formatUnits(balance, 6), 'USDC\n');

  if (balance === 0n) {
    console.error('❌ Insufficient balance for deployment!');
    process.exit(1);
  }

  // Load ProtocolUSDC contract
  const protocolUSDCPath = path.join(__dirname, 'out', 'ProtocolUSDC.sol', 'ProtocolUSDC.json');
  if (!fs.existsSync(protocolUSDCPath)) {
    console.error('❌ ProtocolUSDC not compiled! Run: forge build');
    process.exit(1);
  }

  const protocolUSDCArtifact = JSON.parse(fs.readFileSync(protocolUSDCPath, 'utf8'));
  const protocolUSDCBytecode = protocolUSDCArtifact.bytecode.object;
  const protocolUSDCAbi = protocolUSDCArtifact.abi;

  // Deploy ProtocolUSDC with temporary protocol address (deployer)
  console.log('📦 Deploying ProtocolUSDC (with temporary protocol address)...');
  const protocolUSDCFactory = new ethers.ContractFactory(protocolUSDCAbi, protocolUSDCBytecode, wallet);
  const protocolUSDC = await protocolUSDCFactory.deploy(wallet.address);
  console.log('⏳ ProtocolUSDC transaction:', protocolUSDC.deploymentTransaction()?.hash);
  await protocolUSDC.waitForDeployment();
  const protocolUSDCAddress = await protocolUSDC.getAddress();
  console.log('✅ ProtocolUSDC deployed at:', protocolUSDCAddress, '\n');

  // Load ReputationCredit contract
  const contractPath = path.join(__dirname, 'out', 'ReputationCredit.sol', 'ReputationCredit.json');
  if (!fs.existsSync(contractPath)) {
    console.error('❌ ReputationCredit not compiled! Run: forge build');
    process.exit(1);
  }

  const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  const bytecode = contractArtifact.bytecode.object;
  const abi = contractArtifact.abi;

  console.log('📦 Deploying ReputationCredit with ProtocolUSDC address...');
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  
  // Deploy with ProtocolUSDC address as constructor argument
  const contract = await factory.deploy(protocolUSDCAddress);
  console.log('⏳ Transaction sent:', contract.deploymentTransaction()?.hash);
  console.log('   Waiting for confirmation...\n');

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log('✅ Contract deployed successfully!');
  console.log('📍 ProtocolUSDC Address:', protocolUSDCAddress);
  console.log('📍 ReputationCredit Address:', contractAddress);
  console.log('🌐 Explorer:', `https://testnet.arcscan.app/address/${contractAddress}\n`);

  // Update ProtocolUSDC to use ReputationCredit as protocol contract
  console.log('🔧 Updating ProtocolUSDC to use ReputationCredit as protocol...');
  const setProtocolTx = await protocolUSDC.setProtocolContract(contractAddress);
  await setProtocolTx.wait();
  console.log('✅ ProtocolUSDC protocolContract updated\n');

  // Verify deployment
  const code = await provider.getCode(contractAddress);
  if (code === '0x') {
    console.error('❌ Contract code not found at address!');
    process.exit(1);
  }
  console.log('✅ Contract code verified on-chain\n');

  // Update frontend .env.local
  const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env.local');
  let envContent = '';
  
  if (fs.existsSync(frontendEnvPath)) {
    envContent = fs.readFileSync(frontendEnvPath, 'utf8');
  }

  // Update or add environment variables
  const updates = {
    'NEXT_PUBLIC_CONTRACT_ADDRESS': contractAddress,
    'NEXT_PUBLIC_USDC_ADDRESS': protocolUSDCAddress,
    'NEXT_PUBLIC_ARC_RPC_URL': RPC_URL
  };

  for (const [key, value] of Object.entries(updates)) {
    if (envContent.includes(`${key}=`)) {
      envContent = envContent.replace(
        new RegExp(`${key}=.*`),
        `${key}="${value}"`
      );
    } else {
      envContent += `${key}="${value}"\n`;
    }
  }

  fs.writeFileSync(frontendEnvPath, envContent);
  console.log('✅ Updated frontend/.env.local\n');

  console.log('📋 Next Steps:');
  console.log('   1. Restart frontend: cd ../frontend && npm run dev');
  console.log('   2. Create a credit profile and request a loan');
  console.log('   3. Loans are automatically approved and USDC is minted to borrower');

  return { contractAddress, protocolUSDCAddress };
}

deploy()
  .then(({ contractAddress, protocolUSDCAddress }) => {
    console.log(`\n✅ Deployment complete!`);
    console.log(`   Contract: ${contractAddress}`);
    console.log(`   ProtocolUSDC: ${protocolUSDCAddress}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Deployment failed:', error.message);
    console.error(error);
    process.exit(1);
  });
