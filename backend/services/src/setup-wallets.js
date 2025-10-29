/**
 * Setup Script: Create Dynamic Server Wallets
 * Run this script once to create admin and lender server wallets
 */

import dotenv from 'dotenv'
import { createAuthenticatedClient, createServerWallet } from './dynamic-client.js'
import { ThresholdSignatureScheme } from '@dynamic-labs-wallet/node'

dotenv.config()

async function setupWallets() {
  console.log('🚀 Dynamic Server Wallet Setup')
  console.log('==============================\n')

  const client = await createAuthenticatedClient()

  console.log('✅ Authenticated with Dynamic\n')

  // Create Admin Wallet
  console.log('📝 Creating Admin Wallet...')
  const adminWallet = await createServerWallet(client, {
    thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
    backUpToClientShareService: false,
  })

  console.log('\n✅ Admin Wallet Created:')
  console.log('   Wallet ID:', adminWallet.walletId)
  console.log('   Address:', adminWallet.accountAddress)
  console.log('\n   Add to .env:')
  console.log(`   DYNAMIC_ADMIN_WALLET_ID="${adminWallet.walletId}"`)

  // Create Lender Wallet
  console.log('\n📝 Creating Lender Wallet...')
  const lenderWallet = await createServerWallet(client, {
    thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
    backUpToClientShareService: false,
  })

  console.log('\n✅ Lender Wallet Created:')
  console.log('   Wallet ID:', lenderWallet.walletId)
  console.log('   Address:', lenderWallet.accountAddress)
  console.log('\n   Add to .env:')
  console.log(`   DYNAMIC_LENDER_WALLET_ID="${lenderWallet.walletId}"`)

  console.log('\n\n📋 Next Steps:')
  console.log('1. Add the wallet IDs to your .env file')
  console.log('2. Fund the wallets with USDC for gas fees')
  console.log('3. Add wallet addresses as authorized lenders in the contract:')
  console.log(`   - Admin: ${adminWallet.accountAddress}`)
  console.log(`   - Lender: ${lenderWallet.accountAddress}`)
  console.log('\n4. Run: reputationCredit.addAuthorizedLender(' + lenderWallet.accountAddress + ')')
  console.log('   (Call this from the contract owner account)')

  // Save to a file for convenience
  const config = {
    admin: {
      walletId: adminWallet.walletId,
      address: adminWallet.accountAddress,
    },
    lender: {
      walletId: lenderWallet.walletId,
      address: lenderWallet.accountAddress,
    },
  }

  console.log('\n💾 Configuration saved to wallets-config.json')
  
  return config
}

setupWallets()
  .then(() => {
    console.log('\n✅ Setup complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Setup failed:', error.message)
    process.exit(1)
  })

