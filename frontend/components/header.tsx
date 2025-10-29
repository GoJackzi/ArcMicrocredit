"use client"

import { ConnectButton } from "@/components/connect-button"
import Image from "next/image"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#001a3d] flex items-center justify-center">
              <Image src="/arc-logo.jpg" alt="Arc" width={40} height={40} className="object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Arc Microcredit</h1>
              <p className="text-sm text-muted-foreground">Reputation-Based Protocol</p>
            </div>
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}
