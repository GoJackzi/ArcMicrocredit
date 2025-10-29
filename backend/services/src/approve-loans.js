/**
 * Automated Loan Approval Service
 * Uses Dynamic server wallets to automatically approve loan requests
 */

import dotenv from 'dotenv'
import { createAuthenticatedClient, getWallet } from './dynamic-client.js'
import { createPublicClientForArc, REPUTATION_CREDIT_ABI } from './contract-interaction.js'

dotenv.config()

const CONTRACT_ADDRESS = process.env.REPUTATION_CREDIT_CONTRACT_ADDRESS
const LENDER_WALLET_ID = process.env.DYNAMIC_LENDER_WALLET_ID
const POLLING_INTERVAL = parseInt(process.env.LOAN_POLLING_INTERVAL || '30000') // 30 seconds default

if (!CONTRACT_ADDRESS || !LENDER_WALLET_ID) {
  console.error('❌ Missing required environment variables:')
  console.error('   REPUTATION_CREDIT_CONTRACT_ADDRESS:', CONTRACT_ADDRESS ? '✅' : '❌')
  console.error('   DYNAMIC_LENDER_WALLET_ID:', LENDER_WALLET_ID ? '✅' : '❌')
  process.exit(1)
}

/**
 * Gets all pending loan requests from the contract
 * @param {import('viem').PublicClient} publicClient 
 * @param {string[]} userAddresses - List of user addresses to check
 * @returns {Promise<Array>} Array of pending loans
 */
async function getPendingLoans(publicClient, userAddresses = []) {
  const pendingLoans = []

  // If no addresses provided, you'd need a way to enumerate users
  // For now, this assumes you pass in addresses to check
  for (const userAddress of userAddresses) {
    try {
      const loans = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: REPUTATION_CREDIT_ABI,
        functionName: 'getUserLoans',
        args: [userAddress],
      })

      // Filter for pending loans (not active, not repaid)
      const pending = loans
        .map((loan, index) => ({ ...loan, loanId: index, borrower: userAddress }))
        .filter(loan => !loan.isActive && !loan.isRepaid)

      pendingLoans.push(...pending)
    } catch (error) {
      console.error(`Error fetching loans for ${userAddress}:`, error.message)
    }
  }

  return pendingLoans
}

/**
 * Approves a single loan using Dynamic server wallet
 */
async function approveLoanWithDynamic(pendingLoan) {
  try {
    const dynamicClient = await createAuthenticatedClient()
    const lenderWallet = await getWallet(dynamicClient, LENDER_WALLET_ID)
    
    // Note: This is a simplified version. In production, you'd need to
    // properly integrate Dynamic's transaction signing with Viem
    console.log(`📝 Approving loan ${pendingLoan.loanId} for ${pendingLoan.borrower}`)
    console.log(`   Amount: ${Number(pendingLoan.amount) / 1e6} USDC`)
    console.log(`   Interest Rate: ${Number(pendingLoan.interestRate) / 100}%`)
    
    // TODO: Implement actual transaction signing with Dynamic + Viem
    // For now, this is the structure
    
    console.log('✅ Loan approved (mock)')
    return { success: true, loanId: pendingLoan.loanId }
  } catch (error) {
    console.error(`❌ Failed to approve loan ${pendingLoan.loanId}:`, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Main monitoring loop
 */
async function monitorAndApproveLoans() {
  console.log('🚀 Starting Automated Loan Approval Service')
  console.log('============================================')
  console.log(`Contract: ${CONTRACT_ADDRESS}`)
  console.log(`Lender Wallet ID: ${LENDER_WALLET_ID}`)
  console.log(`Polling Interval: ${POLLING_INTERVAL}ms`)
  console.log('')

  const publicClient = createPublicClientForArc()

  // In production, you'd have a database or event log to track users
  // For demo purposes, we'll check specific addresses
  const userAddressesToCheck = process.env.USER_ADDRESSES_TO_MONITOR?.split(',') || []

  if (userAddressesToCheck.length === 0) {
    console.warn('⚠️  No user addresses configured for monitoring')
    console.warn('   Set USER_ADDRESSES_TO_MONITOR in .env to enable monitoring')
    return
  }

  setInterval(async () => {
    try {
      console.log('\n🔍 Checking for pending loans...')
      const pendingLoans = await getPendingLoans(publicClient, userAddressesToCheck)

      if (pendingLoans.length === 0) {
        console.log('   No pending loans found')
        return
      }

      console.log(`   Found ${pendingLoans.length} pending loan(s)`)

      for (const loan of pendingLoans) {
        await approveLoanWithDynamic(loan)
        // Small delay between approvals
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } catch (error) {
      console.error('❌ Error in monitoring loop:', error.message)
    }
  }, POLLING_INTERVAL)
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  monitorAndApproveLoans().catch(console.error)
}

