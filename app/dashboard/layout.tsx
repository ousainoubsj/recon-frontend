'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Header from '@/components/dashboard/Header'
import Sidebar from '@/components/dashboard/Sidebar'
import { useSession } from '@/lib/auth-client'

// Authoritative session check — proxy.ts's cookie-presence check is only
// optimistic (can't cheaply call the separate Express backend on the edge).
// useSession() also revalidates reactively on window focus, covering the
// "session expired while the tab was open" case proxy.ts can't.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/')
    }
  }, [isPending, session, router])

  if (isPending || !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050F20]">
        <Loader2 className="h-6 w-6 animate-spin text-[#1CEAEA]" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#050F20]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
