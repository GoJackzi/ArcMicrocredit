export function Footer() {
  return (
    <footer className="border-t border-border mt-12 py-6">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <p className="text-sm text-muted-foreground">
          Built on{" "}
          <a
            href="https://testnet.arcscan.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            Arc Testnet
          </a>{" "}
          | Powered by USDC as Gas
        </p>
      </div>
    </footer>
  )
}
