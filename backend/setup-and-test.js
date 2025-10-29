import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const RPC_URL = process.env.ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error('❌ PRIVATE_KEY not found in .env');
  process.exit(1);
}

const REPUTATION_CREDIT_ADDRESS = '0x52B117a6ab623a9Aab3eb7Dc47db82B1D9c17f29';

async function setupAndTest() {
  console.log('🔧 Setting up and testing loan request...\n');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log('📡 Connected to:', (await provider.getNetwork()).name);
  console.log('👤 Wallet:', wallet.address);

  // Load contract ABI
  const contractPath = path.join(__dirname, 'out', 'ReputationCredit.sol', 'ReputationCredit.json');
  if (!fs.existsSync(contractPath)) {
    console.error('❌ Contract ABI not found. Run: forge build');
    process.exit(1);
  }

  const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  const contract = new ethers.Contract(REPUTATION_CREDIT_ADDRESS, contractArtifact.abi, wallet);

  // Check if profile exists
  console.log('\n📋 Checking credit profile...');
  const hasProfile = await contract.checkActiveProfile(wallet.address);
  console.log('Has active profile:', hasProfile);

  if (!hasProfile) {
    console.log('\n📝 Creating credit profile...');
    try {
      // Try default profile creation (starts with 500)
      const tx = await contract.createCreditProfile();
      console.log('⏳ Transaction sent:', tx.hash);
      console.log('   Waiting for confirmation...');
      
      await tx.wait();
      console.log('✅ Credit profile created successfully!');
    } catch (error) {
      console.error('❌ Failed to create profile:', error.message);
      
      // Try with explicit score
      try {
        console.log('\n🔄 Trying with explicit score...');
        const tx2 = await contract.createCreditProfile(500);
        await tx2.wait();
        console.log('✅ Credit profile created with explicit score!');
      } catch (error2) {
        console.error('❌ Also failed with explicit score:', error2.message);
        throw error2;
      }
    }
  } else {
    const profile = await contract.getUserProfile(wallet.address);
    console.log('✅ Profile exists!');
    console.log('   Credit Score:', profile.creditScore.toString());
    console.log('   Active Loans:', profile.activeLoans.toString());
  }

  // Get loan limit
  const loanLimit = await contract.getLoanLimit(wallet.address);
  const minLoan = await contract.minLoanAmount();
  
  console.log('\n📊 Loan Limits:');
  console.log('   Max Loan Limit:', ethers.formatUnits(loanLimit, 6), 'USDC');
  console.log('   Min Loan Amount:', ethers.formatUnits(minLoan, 6), 'USDC');

  // Test loan request with minimum amount
  const testAmount = loanLimit < minLoan ? minLoan : minLoan;
  const testTermDays = 30;

  console.log('\n🧪 Testing loan request...');
  console.log('   Amount:', ethers.formatUnits(testAmount, 6), 'USDC');
  console.log('   Term:', testTermDays, 'days');

  // Estimate gas first
  try {
    const gasEstimate = await contract.requestLoan.estimateGas(testAmount, testTermDays);
    console.log('   Gas Estimate:', gasEstimate.toString());

    // Try the transaction (you can uncomment to actually send)
    console.log('\n⚠️  This is a dry run. To actually request the loan, uncomment the transaction code.');
    /*
    const tx = await contract.requestLoan(testAmount, testTermDays);
    console.log('⏳ Transaction sent:', tx.hash);
    await tx.wait();
    console.log('✅ Loan requested successfully!');
    */
  } catch (error) {
    console.error('\n❌ Loan request would fail:', error.message);
    
    if (error.message.includes('No active credit profile')) {
      console.log('\n💡 Issue: Profile might not be active. Try creating profile again.');
    } else if (error.message.includes('exceeds loan limit')) {
      console.log('\n💡 Issue: Amount exceeds your loan limit based on credit score.');
    } else if (error.message.includes('Only protocol can call this')) {
      console.log('\n💡 Issue: ProtocolUSDC protocolContract not set correctly!');
      console.log('   Run: node fix-protocol-contract.js');
    } else {
      console.log('\n💡 Full error details:');
      console.error(error);
    }
  }

  console.log('\n✅ Setup and test complete!');
}

setupAndTest()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });

