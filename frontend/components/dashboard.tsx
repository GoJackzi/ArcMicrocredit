"use client"

import { useAccount } from "wagmi"
import { UserInfo } from "@/components/user-info"
import { LoanActions } from "@/components/loan-actions"
import { Card } from "@/components/ui/card"

export function Dashboard() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <Card className="p-12 text-center shadow-xl bg-white border-slate-200">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#0066FF]/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#0066FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Connect Your Wallet</h2>
            <p className="text-slate-600 max-w-md">
              Connect your MetaMask wallet to access the microcredit protocol and view your credit score
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <UserInfo />
      <LoanActions />
    </div>
  )
}
