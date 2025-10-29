"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"

const mockUsers = [
  { address: "0x1234...5678", score: 750 },
  { address: "0xabcd...ef12", score: 680 },
  { address: "0x9876...4321", score: 820 },
]

export function AdminPanel() {
  const [userAddress, setUserAddress] = useState("")
  const [score, setScore] = useState("")
  const [isOwner, setIsOwner] = useState(true) // Toggle this to show/hide admin panel

  if (!isOwner) {
    return null
  }

  const handleUpdateScore = async () => {
    if (!userAddress || !score) {
      toast.error("Please enter both address and score")
      return
    }

    setTimeout(() => {
      toast.success("Credit score updated!")
      setUserAddress("")
      setScore("")
    }, 1000)
  }

  return (
    <Card className="p-6 shadow-lg border-[#0066FF]/20 bg-white">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-[#0066FF] animate-pulse" />
        <h2 className="text-lg font-semibold text-slate-900">Admin Panel</h2>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-700 mb-3">Current Users</h3>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Credit Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {mockUsers.map((user, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-slate-700">{user.address}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-slate-900">{user.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-slate-200">
        <h3 className="text-sm font-medium text-slate-700 mb-3">Update User Score</h3>
        <div>
          <Label htmlFor="userAddress" className="text-sm font-medium text-slate-700">
            User Address
          </Label>
          <Input
            id="userAddress"
            type="text"
            placeholder="0x..."
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="score" className="text-sm font-medium text-slate-700">
            Credit Score
          </Label>
          <Input
            id="score"
            type="number"
            placeholder="0"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="mt-2"
          />
        </div>
        <Button onClick={handleUpdateScore} className="w-full bg-[#0066FF] hover:bg-[#0052cc]">
          Update Credit Score
        </Button>
      </div>
    </Card>
  )
}
