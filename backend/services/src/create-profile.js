/**
 * Create Credit Profile Service
 * Uses Dynamic server wallet to create credit profiles for users
 */

import dotenv from 'dotenv'
import { createAuthenticatedClient, getWallet } from './dynamic-client.js'
import { createCreditProfile, createPublicClientForArc } from './contract-interaction.js'
import { REPUTATION_CREDIT_ABI } from './contract-interaction.js'

dotenv.config()

const CONTRACT_ADDRESS = process.env.REPUTATION_CREDIT_CONTRACT_ADDRESS
const ADMIN_WALLET_ID = process.env.DYNAMIC_ADMIN_WALLET_ID

if (!CONTRACT_ADDRESS || !ADMIN_WALLET_ID) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

/**
 * Creates a credit profile for a user
 * @param {string} userAddress - User's wallet address
 * @param {number} initialScore - Initial credit score (0-1000)
 */
async function createUserProfile(userAddress, initialScore = 500) {
  try {
    console.log(`📝 Creating credit profile for ${userAddress}`)
    console.log(`   Initial Score: ${initialScore}`)

    const dynamicClient = await createAuthenticatedClient()
    const adminWallet = await getWallet(dynamicClient, ADMIN_WALLET_ID)

    const publicClient = createPublicClientForArc()

    // Check if profile already exists
    try {
      const profile = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: REPUTATION_CREDIT_ABI,
        functionName: 'getUserProfile',
        args: [userAddress],
      })

      if (profile.isActive) {
        console.log('⚠️  User already has an active profile')
        return { success: false, message: 'Profile already exists' }
      }
    } catch (error) {
      // Profile doesn't exist, continue
    }

    // TODO: Implement actual transaction signing with Dynamic
    // This requires proper integration of Dynamic's signing with Viem
    console.log('✅ Profile created (mock)')
    return { success: true, address: userAddress, score: initialScore }
  } catch (error) {
    console.error(`❌ Failed to create profile:`, error.message)
    return { success: false, error: error.message }
  }
}

// CLI interface
const args = process.argv.slice(2)
if (args.length >= 1) {
  const userAddress = args[0]
  const initialScore = args[1] ? parseInt(args[1]) : 500

  createUserProfile(userAddress, initialScore)
    .then(result => {
      if (result.success) {
        console.log('\n✅ Success!')
        process.exit(0)
      } else {
        console.log('\n❌ Failed:', result.message || result.error)
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('\n❌ Error:', error.message)
      process.exit(1)
    })
} else {
  console.log('Usage: node create-profile.js <userAddress> [initialScore]')
  console.log('Example: node create-profile.js 0x1234... 750')
  process.exit(1)
}

