import { ethers } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const RPC_URL = process.env.ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error('❌ PRIVATE_KEY not found');
  process.exit(1);
}

const REPUTATION_CREDIT_ADDRESS = '0x52B117a6ab623a9Aab3eb7Dc47db82B1D9c17f29';

async function testLoanRequest() {
  console.log('🧪 Testing loan request setup...\n');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log('📡 Connected to:', (await provider.getNetwork()).name);
  console.log('👤 Testing with wallet:', wallet.address);

  const contractAbi = [
    'function checkActiveProfile(address user) external view returns (bool)',
    'function getCreditScore(address user) external view returns (uint256)',
    'function getLoanLimit(address user) external view returns (uint256)',
    'function getUserProfile(address user) external view returns (tuple(uint256 creditScore, uint256 totalBorrowed, uint256 totalRepaid, uint256 activeLoans, uint256 lastLoanTime, bool isActive, uint256 reputationPoints))',
    'function minLoanAmount() external view returns (uint256)',
    'function maxLoanAmount() external view returns (uint256)',
  ];

  const contract = new ethers.Contract(REPUTATION_CREDIT_ADDRESS, contractAbi, provider);

  console.log('\n📋 Checking user status...');
  
  const hasProfile = await contract.checkActiveProfile(wallet.address);
  console.log('Has active profile:', hasProfile);

  if (!hasProfile) {
    console.log('\n❌ ERROR: No active credit profile!');
    console.log('💡 Solution: Create a credit profile first using the "Create Credit Profile" button');
    return;
  }

  const profile = await contract.getUserProfile(wallet.address);
  console.log('Credit Score:', profile.creditScore.toString());
  console.log('Active Loans:', profile.activeLoans.toString());

  const creditScore = await contract.getCreditScore(wallet.address);
  console.log('Credit Score:', creditScore.toString());

  const loanLimit = await contract.getLoanLimit(wallet.address);
  console.log('Max Loan Limit:', ethers.formatUnits(loanLimit, 6), 'USDC');

  const minLoan = await contract.minLoanAmount();
  const maxLoan = await contract.maxLoanAmount();
  console.log('Min Loan Amount:', ethers.formatUnits(minLoan, 6), 'USDC');
  console.log('Max Loan Amount:', ethers.formatUnits(maxLoan, 6), 'USDC');

  // Test with a small loan amount
  const testAmount = ethers.parseUnits('100', 6); // 100 USDC
  console.log('\n🧪 Testing with:', ethers.formatUnits(testAmount, 6), 'USDC');

  if (loanLimit < testAmount) {
    console.log('⚠️  Test amount exceeds loan limit!');
    console.log('Using loan limit instead...');
    const safeAmount = loanLimit;
    
    // Check if it's at least the minimum
    if (safeAmount < minLoan) {
      console.log('\n❌ ERROR: Your loan limit is below the minimum loan amount!');
      console.log('Loan Limit:', ethers.formatUnits(safeAmount, 6), 'USDC');
      console.log('Minimum:', ethers.formatUnits(minLoan, 6), 'USDC');
      console.log('\n💡 Your credit score might be too low. Try building your credit first.');
      return;
    }
  }

  console.log('\n✅ All checks passed! The issue might be:');
  console.log('   1. Gas estimation failure (try increasing gas limit)');
  console.log('   2. Network congestion');
  console.log('   3. Frontend ABI mismatch');
  console.log('\n💡 Try the transaction again, or check the transaction details on ArcScan');
}

testLoanRequest().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

