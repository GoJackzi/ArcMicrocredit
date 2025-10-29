import { readContract, writeContract, type Address } from 'viem'
import { createPublicClient, http } from 'viem'
import { arcTestnet } from './wagmi'

// Contract address from environment
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as Address

// Load ABI from backend output (will be available after forge build)
// For now, we'll define it inline based on ReputationCredit.sol
export const REPUTATION_CREDIT_ABI = [
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getCreditScore',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getLoanLimit',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'amount', type: 'uint256' }, { name: 'termDays', type: 'uint256' }],
    name: 'requestLoan',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'loanId', type: 'uint256' }],
    name: 'repayLoan',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getContractBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'fundContract',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'usdcToken',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
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
  {
    inputs: [],
    name: 'getProtocolStats',
    outputs: [
      { name: 'totalLoans', type: 'uint256' },
      { name: 'totalBorrowed', type: 'uint256' },
      { name: 'totalRepaid', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'checkActiveProfile',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'initialScore', type: 'uint256' }],
    name: 'createCreditProfile',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'createCreditProfile',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }, { name: 'requestedAmount', type: 'uint256' }],
    name: 'getLoanApprovalDetails',
    outputs: [
      { name: 'creditScore', type: 'uint256' },
      { name: 'maxLoanLimit', type: 'uint256' },
      { name: 'approvedAmount', type: 'uint256' },
      { name: 'interestRate', type: 'uint256' },
      { name: 'riskScore', type: 'uint256' },
      { name: 'reason', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'depositNativeUSDC',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

// Helper function to load ABI from backend
async function loadABIFromBackend(): Promise<any> {
  if (typeof window === 'undefined') return REPUTATION_CREDIT_ABI

  try {
    // Try to load from backend output
    const response = await fetch('/api/contract-abi')
    if (response.ok) {
      const data = await response.json()
      return data.abi || REPUTATION_CREDIT_ABI
    }
  } catch (error) {
    console.warn('Could not load ABI from backend, using inline ABI:', error)
  }
  return REPUTATION_CREDIT_ABI
}

// Contract interaction functions
export async function getCreditScore(userAddress: Address): Promise<bigint> {
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network'),
  })

  const abi = await loadABIFromBackend()
  return await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'getCreditScore',
    args: [userAddress],
  }) as bigint
}

export async function getLoanLimit(userAddress: Address): Promise<bigint> {
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network'),
  })

  const abi = await loadABIFromBackend()
  return await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'getLoanLimit',
    args: [userAddress],
  }) as bigint
}

export async function getUserProfile(userAddress: Address) {
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network'),
  })

  const abi = await loadABIFromBackend()
  return await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'getUserProfile',
    args: [userAddress],
  })
}

export async function getUserLoans(userAddress: Address) {
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network'),
  })

  const abi = await loadABIFromBackend()
  return await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'getUserLoans',
    args: [userAddress],
  })
}

export async function getProtocolStats() {
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network'),
  })

  const abi = await loadABIFromBackend()
  return await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'getProtocolStats',
  })
}

// Export ABI for use in components
export { REPUTATION_CREDIT_ABI as CONTRACT_ABI }

