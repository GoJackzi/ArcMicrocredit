"use client"

import { useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { parseUnits, formatUnits } from "viem"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract"
import { USDC_ADDRESS, USDC_ABI } from "@/lib/usdc"
import { ARC_USDC_ADDRESS, ARC_USDC_ABI } from "@/lib/arc-usdc"

// Max uint256 value for unlimited approvals
const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")

export function LoanActions() {
  const { address } = useAccount()
  const [amount, setAmount] = useState("")
  const [termDays, setTermDays] = useState("30")
  const [depositAmount, setDepositAmount] = useState("")

  const { data: userProfile } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: userLoans } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserLoans',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Get loan approval details when amount is entered
  const { data: approvalDetails } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getLoanApprovalDetails',
    args: address && amount && Number(amount) > 0 ? [address, parseUnits(amount, 6)] : undefined,
    query: {
      enabled: !!address && !!amount && Number(amount) > 0 && !!userProfile?.isActive,
    },
  })

  const { writeContract: requestLoan, data: requestHash } = useWriteContract()
  const { writeContract: repayLoan, data: repayHash } = useWriteContract()
  const { writeContract: createProfile, data: createProfileHash } = useWriteContract()
  const { writeContract: approveUSDC, data: approveHash } = useWriteContract()
  const { writeContract: approveArcUSDC, data: approveArcHash } = useWriteContract()
  const { writeContract: depositUSDC, data: depositHash } = useWriteContract()

  const { data: arcUSDCBalance } = useReadContract({
    address: ARC_USDC_ADDRESS,
    abi: ARC_USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && USDC_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  })

  const { isLoading: isRequestPending } = useWaitForTransactionReceipt({
    hash: requestHash,
  })

  const { isLoading: isRepayPending } = useWaitForTransactionReceipt({
    hash: repayHash,
  })

  const { isLoading: isCreateProfilePending } = useWaitForTransactionReceipt({
    hash: createProfileHash,
  })

  const { isLoading: isDepositPending } = useWaitForTransactionReceipt({
    hash: depositHash,
  })

  // Find active loans
  const activeLoans = userLoans
    ? (userLoans as any[]).filter((loan: any) => loan.isActive && !loan.isRepaid)
    : []

  const hasActiveLoan = activeLoans.length > 0

  const handleRequestLoan = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (!termDays || Number(termDays) < 7 || Number(termDays) > 365) {
      toast.error("Loan term must be between 7 and 365 days")
      return
    }

    if (!userProfile || !userProfile.isActive) {
      toast.error("You need an active credit profile. Create one below.")
      return
    }

    try {
      const amountInWei = parseUnits(amount, 6) // USDC has 6 decimals
      requestLoan({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "requestLoan",
        args: [amountInWei, BigInt(termDays)],
      })
      toast.success("Loan request submitted!")
      setAmount("")
    } catch (error: any) {
      toast.error(error?.message || "Failed to request loan")
      console.error(error)
    }
  }

  const handleRepayLoan = async (loanIndex: number) => {
    try {
      if (!userLoans || !Array.isArray(userLoans)) {
        toast.error("No loans found")
        return
      }

      const allLoans = userLoans as any[]
      let actualLoanId = -1
      let activeCount = 0

      for (let i = 0; i < allLoans.length; i++) {
        if (allLoans[i].isActive && !allLoans[i].isRepaid) {
          if (activeCount === loanIndex) {
            actualLoanId = i
            break
          }
          activeCount++
        }
      }

      if (actualLoanId === -1) {
        toast.error("Loan not found")
        return
      }

      const loan = allLoans[actualLoanId]

      // Calculate repayment amount (principal + interest)
      // Match contract formula: (amount * interestRate * timeElapsed) / (365 days * 10000)
      const now = BigInt(Math.floor(Date.now() / 1000))
      const timeElapsed = now - loan.startTime
      
      // 365 days in seconds = 365 * 24 * 60 * 60 = 31,536,000
      const SECONDS_PER_YEAR = 365n * 24n * 60n * 60n
      const interestAmount = (loan.amount * loan.interestRate * timeElapsed) / (SECONDS_PER_YEAR * 10000n)
      const totalRepayment = loan.amount + interestAmount

      // Check USDC balance
      const balance = usdcBalance as bigint || 0n
      if (balance < totalRepayment) {
        toast.error(`Insufficient USDC balance. Need ${formatUnits(totalRepayment, 6)} USDC`)
        return
      }

      // First approve USDC spending (max approval for all future repayments)
      toast.loading("Approving USDC spending (max approval)...")
      await approveUSDC({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, MAX_UINT256],
      })

      // Wait a bit for approval
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Then repay the loan
      toast.loading("Repaying loan...")
      await repayLoan({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "repayLoan",
        args: [BigInt(actualLoanId)],
      })
      
      toast.success("Repayment submitted!")
    } catch (error: any) {
      toast.error(error?.message || "Failed to repay loan")
      console.error(error)
    }
  }

  return (
    <Card className="p-6 shadow-lg bg-white border-slate-200">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Loan Management</h2>
      <div className="space-y-4">
        {!userProfile?.isActive && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-3">
              Create your credit profile to start requesting loans. Everyone starts with a fair credit score of 500.
            </p>
            <Button
              onClick={async () => {
                try {
                  await createProfile({
                    address: CONTRACT_ADDRESS,
                    abi: CONTRACT_ABI,
                    functionName: "createCreditProfile",
                    args: [500], // Explicitly pass 500 as initial score
                  })
                  toast.success("Creating your credit profile...")
                } catch (error: any) {
                  console.error("Create profile error:", error)
                  const errorMessage = error?.message || error?.shortMessage || "Failed to create profile"
                  
                  // Check specific error cases
                  if (errorMessage.includes("execution reverted") || errorMessage.includes("revert")) {
                    // Try to get more specific error
                    if (errorMessage.includes("Profile already exists")) {
                      toast.error("You already have a credit profile!")
                    } else if (errorMessage.includes("Invalid initial score")) {
                      toast.error("Invalid score. Must be between 0-1000.")
                    } else {
                      toast.error("Transaction failed. The contract may need to be redeployed.")
                    }
                  } else if (errorMessage.includes("function") && errorMessage.includes("not found")) {
                    toast.error("Function not found. Contract needs to be redeployed with new functions.")
                  } else {
                    toast.error(errorMessage)
                  }
                }
              }}
              disabled={isCreateProfilePending}
              className="w-full bg-[#0066FF] hover:bg-[#0052cc]"
            >
              {isCreateProfilePending ? "Creating Profile..." : "Create Credit Profile (Start with 500)"}
            </Button>
          </div>
        )}

        {userProfile?.isActive && (
          <>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <p className="text-xs text-blue-800">
                💰 ARC USDC: {arcUSDCBalance ? formatUnits(arcUSDCBalance as bigint, 6) : '0.00'} USDC
                <br />
                💰 ProtocolUSDC: {usdcBalance ? formatUnits(usdcBalance as bigint, 6) : '0.00'} USDC
                {(!usdcBalance || usdcBalance === 0n) && (
                  <span className="block mt-1 text-xs text-blue-600">
                    You'll receive USDC automatically when you request a loan (auto-approved)
                  </span>
                )}
              </p>
            </div>

            {/* Deposit Section */}
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg mb-4">
              <h3 className="text-sm font-semibold text-purple-900 mb-2">💎 Deposit ARC USDC</h3>
              <p className="text-xs text-purple-700 mb-3">
                Exchange Rate: <strong>1 ARC USDC = 500 ProtocolUSDC</strong>
              </p>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="mb-2"
                  step="0.000001"
                  min="0"
                />
                {depositAmount && Number(depositAmount) > 0 && (
                  <p className="text-xs text-purple-600 font-medium">
                    You'll receive: <strong>{(Number(depositAmount) * 500).toLocaleString()}</strong> ProtocolUSDC
                  </p>
                )}
                <Button
                  onClick={async () => {
                    if (!depositAmount || Number(depositAmount) <= 0) {
                      toast.error("Please enter a valid amount")
                      return
                    }

                    try {
                      const amountInWei = parseUnits(depositAmount, 6) // ARC USDC has 6 decimals
                      
                      // Check balance
                      const balance = arcUSDCBalance as bigint || 0n
                      if (balance < amountInWei) {
                        toast.error(`Insufficient ARC USDC balance. You have ${formatUnits(balance, 6)} USDC`)
                        return
                      }

                      // First approve ReputationCredit to spend ARC USDC (max approval for all future deposits)
                      toast.loading("Approving ARC USDC spending (max approval)...")
                      await approveArcUSDC({
                        address: ARC_USDC_ADDRESS,
                        abi: ARC_USDC_ABI,
                        functionName: "approve",
                        args: [CONTRACT_ADDRESS, MAX_UINT256],
                      })

                      // Wait for approval
                      await new Promise(resolve => setTimeout(resolve, 2000))

                      // Then deposit
                      toast.loading(`Depositing ${depositAmount} ARC USDC...`)
                      await depositUSDC({
                        address: CONTRACT_ADDRESS,
                        abi: CONTRACT_ABI,
                        functionName: "depositNativeUSDC",
                        args: [amountInWei],
                      })
                      toast.success(`Depositing ${depositAmount} ARC USDC for ${Number(depositAmount) * 500} ProtocolUSDC...`)
                      setDepositAmount("")
                    } catch (error: any) {
                      toast.error(error?.message || "Deposit failed")
                      console.error(error)
                    }
                  }}
                  disabled={isDepositPending || !depositAmount || Number(depositAmount) <= 0}
                  variant="outline"
                  size="sm"
                  className="w-full border-purple-500 text-purple-600 hover:bg-purple-100"
                >
                  {isDepositPending ? "Depositing..." : `Deposit ${depositAmount || "0"} ARC USDC`}
                </Button>
                {depositHash && (
                  <a
                    href={`https://testnet.arcscan.app/tx/${depositHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:underline inline-flex items-center gap-1"
                  >
                    View deposit on ArcScan ↗
                  </a>
                )}
              </div>
            </div>
          </>
        )}

        <div>
          <Label htmlFor="amount" className="text-sm font-medium text-slate-700">
            Loan Amount (USDC)
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={hasActiveLoan || !userProfile?.isActive}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="termDays" className="text-sm font-medium text-slate-700">
            Loan Term (days, 7-365)
          </Label>
          <Input
            id="termDays"
            type="number"
            placeholder="30"
            value={termDays}
            onChange={(e) => setTermDays(e.target.value)}
            disabled={hasActiveLoan || !userProfile?.isActive}
            className="mt-2"
            min={7}
            max={365}
          />
        </div>

        {/* Loan Approval Calculation Display */}
        {amount && Number(amount) > 0 && approvalDetails && userProfile?.isActive && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Loan Approval Calculation</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Credit Score:</span>
                <span className="font-medium">{Number(approvalDetails[0])}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Max Loan Limit:</span>
                <span className="font-medium">{formatUnits(approvalDetails[1] as bigint, 6)} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Requested Amount:</span>
                <span className="font-medium">{amount} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Approved Amount:</span>
                <span className={`font-medium ${Number(approvalDetails[2] as bigint) === parseUnits(amount, 6) ? 'text-green-600' : 'text-orange-600'}`}>
                  {formatUnits(approvalDetails[2] as bigint, 6)} USDC
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Interest Rate:</span>
                <span className="font-medium">{(Number(approvalDetails[3] as bigint) / 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Risk Score:</span>
                <span className={`font-medium ${Number(approvalDetails[4] as bigint) > 500 ? 'text-red-600' : 'text-green-600'}`}>
                  {Number(approvalDetails[4] as bigint)}/1000
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <p className="text-slate-700 font-medium text-xs">📋 {approvalDetails[5] as string}</p>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleRequestLoan}
          disabled={hasActiveLoan || isRequestPending || !userProfile?.isActive}
          className="w-full bg-[#0066FF] hover:bg-[#0052cc]"
        >
          {isRequestPending ? "Requesting & Auto-Approving..." : "Request Loan (Auto-Approved)"}
        </Button>

        {hasActiveLoan && (
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <p className="text-sm font-medium text-slate-700 mb-2">Active Loans:</p>
            {activeLoans.map((loan: any, index: number) => {
              const now = Math.floor(Date.now() / 1000);
              const dueDate = Number(loan.dueDate);
              const daysUntilDue = Math.ceil((dueDate - now) / (24 * 60 * 60));
              const isOverdue = now > dueDate;
              const daysOverdue = isOverdue ? Math.ceil((now - dueDate) / (24 * 60 * 60)) : 0;
              
              return (
                <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        Loan #{index} - {(Number(loan.amount) / 1e6).toFixed(2)} USDC
                      </p>
                      <p className="text-xs text-slate-600">
                        Interest Rate: {(Number(loan.interestRate) / 100).toFixed(2)}%
                      </p>
                      <p className={`text-xs mt-1 font-medium ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                        {isOverdue 
                          ? `⚠️ Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`
                          : `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`
                        }
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Due Date: {new Date(Number(loan.dueDate) * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleRepayLoan(index)}
                      disabled={isRepayPending}
                      variant="outline"
                      size="sm"
                      className={`border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF]/5 ${isOverdue ? 'border-red-500 text-red-600' : ''}`}
                    >
                      {isRepayPending ? "Repaying..." : "Repay"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(requestHash || repayHash || createProfileHash) && (
          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-2">Transaction Status:</p>
            <a
              href={`https://testnet.arcscan.app/tx/${requestHash || repayHash || createProfileHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#0066FF] hover:underline font-medium inline-flex items-center gap-1"
            >
              View on ArcScan
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        )}
      </div>
    </Card>
  )
}
