/**
 * Dynamic Wallet Setup - REST API Version (Windows Compatible)
 * Uses Dynamic REST API instead of Node SDK for Windows compatibility
 */

import fetch from 'node-fetch'
import 'dotenv/config'

const ENVIRONMENT_ID = process.env.DYNAMIC_ENVIRONMENT_ID
const API_TOKEN = process.env.DYNAMIC_API_TOKEN
const API_BASE_URL = 'https://app.dynamicauth.com/api/v0'

if (!ENVIRONMENT_ID || !API_TOKEN) {
  console.error('❌ Missing DYNAMIC_ENVIRONMENT_ID or DYNAMIC_API_TOKEN')
  process.exit(1)
}

async function createWalletViaAPI() {
  try {
    console.log('📝 Creating server wallet via Dynamic API...')
    
    const response = await fetch(`${API_BASE_URL}/environments/${ENVIRONMENT_ID}/serverWallets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        thresholdSignatureScheme: 'TWO_OF_TWO',
        backUpToClientShareService: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} - ${errorText}`)
    }

    const wallet = await response.json()
    return wallet
  } catch (error) {
    console.error('❌ Failed to create wallet:', error.message)
    throw error
  }
}

async function setupWallets() {
  console.log('🚀 Dynamic Server Wallet Setup (REST API)')
  console.log('==========================================\n')
  console.log(`Environment ID: ${ENVIRONMENT_ID}\n`)

  try {
    // Check if node-fetch is available
    try {
      await import('node-fetch')
    } catch {
      console.log('📦 Installing node-fetch...')
      const { execSync } = await import('child_process')
      execSync('npm install node-fetch@2', { stdio: 'inherit' })
      // Re-import after installation
      const fetch = (await import('node-fetch')).default
    }

    // Create Admin Wallet
    console.log('📝 Creating Admin Wallet...')
    const adminWallet = await createWalletViaAPI()

    console.log('\n✅ Admin Wallet Created:')
    console.log('   Wallet ID:', adminWallet.walletId || adminWallet.id)
    console.log('   Address:', adminWallet.accountAddress || adminWallet.address)
    console.log('\n   Add to .env:')
    console.log(`   DYNAMIC_ADMIN_WALLET_ID="${adminWallet.walletId || adminWallet.id}"`)

    // Create Lender Wallet
    console.log('\n📝 Creating Lender Wallet...')
    const lenderWallet = await createWalletViaAPI()

    console.log('\n✅ Lender Wallet Created:')
    console.log('   Wallet ID:', lenderWallet.walletId || lenderWallet.id)
    console.log('   Address:', lenderWallet.accountAddress || lenderWallet.address)
    console.log('\n   Add to .env:')
    console.log(`   DYNAMIC_LENDER_WALLET_ID="${lenderWallet.walletId || lenderWallet.id}"`)

    // Save configuration
    const config = {
      admin: {
        walletId: adminWallet.walletId || adminWallet.id,
        address: adminWallet.accountAddress || adminWallet.address,
      },
      lender: {
        walletId: lenderWallet.walletId || lenderWallet.id,
        address: lenderWallet.accountAddress || lenderWallet.address,
      },
    }

    fs.writeFileSync('wallets-config.json', JSON.stringify(config, null, 2))
    console.log('\n💾 Configuration saved to wallets-config.json')

    console.log('\n\n📋 Next Steps:')
    console.log('1. Add the wallet IDs to your .env file')
    console.log('2. Fund the wallets with USDC for gas fees')
    console.log('3. Add wallet addresses as authorized lenders in the contract:')
    console.log(`   - Admin: ${config.admin.address}`)
    console.log(`   - Lender: ${config.lender.address}`)
    console.log('\n4. Run: reputationCredit.addAuthorizedLender(' + config.lender.address + ')')
    console.log('   (Call this from the contract owner account)')

    console.log('\n✅ Setup complete!')
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message)
    console.error('\nNote: Dynamic Node SDK requires Linux/macOS.')
    console.error('For Windows, you may need to:')
    console.error('1. Use WSL with Node.js installed')
    console.error('2. Use Dynamic Dashboard to create wallets manually')
    console.error('3. Or use a Linux/macOS server for wallet operations')
    process.exit(1)
  }
}

setupWallets()

