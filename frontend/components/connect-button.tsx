"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <Button onClick={() => disconnect()} variant="outline" className="font-medium">
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    )
  }

  const injectedConnector = connectors.find(c => c.id === 'injected' || c.id === 'metaMask')

  return (
    <Button 
      onClick={() => connect({ connector: injectedConnector || connectors[0] })} 
      className="font-medium"
    >
      Connect Wallet
    </Button>
  )
}
