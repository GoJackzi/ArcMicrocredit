"use client"

import { useAccount } from "wagmi"
import { useReadContract } from "wagmi"
import { Card } from "@/components/ui/card"
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract"
import { formatUnits } from "viem"

export function UserInfo() {
  const { address } = useAccount()

  const { data: creditScore } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getCreditScore',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: loanLimit } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getLoanLimit',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: userProfile } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const score = creditScore ? Number(creditScore) : 0
  const activeLoanAmount = userProfile ? Number(userProfile.activeLoans) : 0
  const loanLimitAmount = loanLimit ? Number(formatUnits(loanLimit as bigint, 6)) : 0

  const getScoreLabel = (score: number) => {
    if (score >= 800) return "Excellent standing"
    if (score >= 600) return "Good standing"
    if (score >= 400) return "Fair standing"
    if (score >= 200) return "Poor standing"
    return "Very poor standing"
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <Card className="p-6 shadow-lg bg-white border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Your Account</h2>
        {address && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-mono text-slate-700">{formatAddress(address)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#0066FF] to-[#0052cc] rounded-xl p-5 text-white">
          <p className="text-sm opacity-90 mb-2">Credit Score</p>
          <p className="text-4xl font-bold">{score || 0}</p>
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-xs opacity-75">{getScoreLabel(score)}</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-600 mb-2">Active Loans</p>
          <p className="text-4xl font-bold text-slate-900">{activeLoanAmount}</p>
          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500">Number of loans</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-600 mb-2">Loan Limit</p>
          <p className="text-4xl font-bold text-slate-900">{loanLimitAmount.toLocaleString()}</p>
          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500">USDC Available</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
