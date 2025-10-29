/**
 * Dynamic EVM Client Setup
 * Provides authenticated Dynamic client for server-side wallet operations
 */

import { DynamicEvmWalletClient } from '@dynamic-labs-wallet/node-evm'
import { ThresholdSignatureScheme } from '@dynamic-labs-wallet/node'

const ENVIRONMENT_ID = process.env.DYNAMIC_ENVIRONMENT_ID
const AUTH_TOKEN = process.env.DYNAMIC_API_TOKEN

if (!ENVIRONMENT_ID || !AUTH_TOKEN) {
  throw new Error('DYNAMIC_ENVIRONMENT_ID and DYNAMIC_API_TOKEN must be set in environment variables')
}

/**
 * Creates an authenticated Dynamic EVM client
 * @returns {Promise<DynamicEvmWalletClient>}
 */
export async function createAuthenticatedClient() {
  const client = new DynamicEvmWalletClient({ 
    environmentId: ENVIRONMENT_ID 
  })
  
  await client.authenticateApiToken(AUTH_TOKEN)
  return client
}

/**
 * Creates a new server wallet for automated operations
 * @param {DynamicEvmWalletClient} client - Authenticated Dynamic client
 * @param {object} options - Wallet creation options
 * @returns {Promise<{walletId: string, accountAddress: string, externalServerKeyShares: object}>}
 */
export async function createServerWallet(client, options = {}) {
  const {
    thresholdSignatureScheme = ThresholdSignatureScheme.TWO_OF_TWO,
    backUpToClientShareService = false,
  } = options

  const wallet = await client.createWalletAccount({
    thresholdSignatureScheme,
    backUpToClientShareService,
  })

  console.log('✅ Server wallet created:', {
    walletId: wallet.walletId,
    accountAddress: wallet.accountAddress,
  })

  return {
    walletId: wallet.walletId,
    accountAddress: wallet.accountAddress,
    externalServerKeyShares: wallet.externalServerKeyShares,
  }
}

/**
 * Retrieves an existing wallet by ID
 * @param {DynamicEvmWalletClient} client - Authenticated Dynamic client
 * @param {string} walletId - Wallet ID to retrieve
 * @returns {Promise<object>}
 */
export async function getWallet(client, walletId) {
  return await client.getWalletAccount(walletId)
}

/**
 * Signs a message using a server wallet
 * @param {DynamicEvmWalletClient} client - Authenticated Dynamic client
 * @param {string} accountAddress - Wallet account address
 * @param {string} message - Message to sign
 * @param {string} password - Optional password
 * @returns {Promise<string>}
 */
export async function signMessage(client, accountAddress, message, password = undefined) {
  return await client.signMessage({
    message,
    accountAddress,
    password,
  })
}

