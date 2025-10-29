import { Header } from "@/components/header"
import { Dashboard } from "@/components/dashboard"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-[800px] mx-auto">
          <Dashboard />
        </div>
      </main>
      <Footer />
    </div>
  )
}
