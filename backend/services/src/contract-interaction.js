/**
 * Contract Interaction Utilities
 * Helper functions for interacting with ReputationCredit contract using Dynamic server wallets
 */

import { createPublicClient, createWalletClient, http, parseUnits, encodeFunctionData } from 'viem'
import { arcTestnet } from '../config/chains.js'

// Contract ABI for ReputationCredit
export const REPUTATION_CREDIT_ABI = [
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'initialScore', type: 'uint256' },
    ],
    name: 'createCreditProfile',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'borrower', type: 'address' },
      { name: 'loanId', type: 'uint256' },
    ],
    name: 'approveLoan',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'points', type: 'uint256' },
      { name: 'reason', type: 'string' },
    ],
    name: 'addReputationPoints',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserProfile',
    outputs: [
      {
        components: [
          { name: 'creditScore', type: 'uint256' },
          { name: 'totalBorrowed', type: 'uint256' },
          { name: 'totalRepaid', type: 'uint256' },
          { name: 'activeLoans', type: 'uint256' },
          { name: 'lastLoanTime', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
          { name: 'reputationPoints', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserLoans',
    outputs: [
      {
        components: [
          { name: 'amount', type: 'uint256' },
          { name: 'interestRate', type: 'uint256' },
          { name: 'termDays', type: 'uint256' },
          { name: 'startTime', type: 'uint256' },
          { name: 'dueDate', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
          { name: 'isRepaid', type: 'bool' },
          { name: 'repaidAmount', type: 'uint256' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]

/**
 * Creates a Viem public client for Arc Testnet
 */
export function createPublicClientForArc() {
  return createPublicClient({
    chain: arcTestnet,
    transport: http(process.env.ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network'),
  })
}

/**
 * Creates a wallet client from Dynamic server wallet account
 * @param {DynamicEvmWalletClient} dynamicClient - Dynamic client
 * @param {string} accountAddress - Wallet account address
 * @returns {Promise<import('viem').WalletClient>}
 */
export async function createWalletClientFromDynamic(dynamicClient, accountAddress) {
  // Dynamic provides a way to get the signing function
  // We'll create an adapter that works with Viem
  const signer = async (message) => {
    return await dynamicClient.signMessage({
      message: typeof message === 'string' ? message : message.hash || message,
      accountAddress,
    })
  }

  const publicClient = createPublicClientForArc()
  
  // Create a custom account for Viem that uses Dynamic signing
  const account = {
    address: accountAddress,
    type: 'json-rpc',
    signMessage: signer,
    signTransaction: async (transaction) => {
      // Dynamic handles transaction signing through their SDK
      // This would need to be implemented based on Dynamic's transaction signing API
      throw new Error('Transaction signing through Dynamic adapter not yet implemented')
    },
  }

  return createWalletClient({
    account,
    chain: arcTestnet,
    transport: http(process.env.ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network'),
  })
}

/**
 * Creates a credit profile for a user
 * @param {object} params
 * @param {import('viem').WalletClient} walletClient - Wallet client with lender permissions
 * @param {string} contractAddress - ReputationCredit contract address
 * @param {string} userAddress - User address to create profile for
 * @param {number} initialScore - Initial credit score (0-1000)
 * @returns {Promise<string>} Transaction hash
 */
export async function createCreditProfile({
  walletClient,
  contractAddress,
  userAddress,
  initialScore,
}) {
  const data = encodeFunctionData({
    abi: REPUTATION_CREDIT_ABI,
    functionName: 'createCreditProfile',
    args: [userAddress, BigInt(initialScore)],
  })

  const hash = await walletClient.sendTransaction({
    to: contractAddress,
    data,
  })

  return hash
}

/**
 * Approves a loan
 * @param {object} params
 * @param {import('viem').WalletClient} walletClient - Wallet client with lender permissions
 * @param {string} contractAddress - ReputationCredit contract address
 * @param {string} borrowerAddress - Borrower's address
 * @param {number} loanId - Loan ID to approve
 * @returns {Promise<string>} Transaction hash
 */
export async function approveLoan({
  walletClient,
  contractAddress,
  borrowerAddress,
  loanId,
}) {
  const data = encodeFunctionData({
    abi: REPUTATION_CREDIT_ABI,
    functionName: 'approveLoan',
    args: [borrowerAddress, BigInt(loanId)],
  })

  const hash = await walletClient.sendTransaction({
    to: contractAddress,
    data,
  })

  return hash
}

