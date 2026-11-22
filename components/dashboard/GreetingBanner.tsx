'use client'

import Image from 'next/image'
import Typewriter from 'typewriter-effect'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useSession } from '@/lib/auth-client'

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export default function GreetingBanner() {
  const router = useRouter()
  const { data: session } = useSession()
  const firstName = session?.user.name?.split(' ')[0] ?? 'there'
  const greeting = greetingForHour(new Date().getHours())

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
          <span className="whitespace-nowrap">
            {greeting},{' '}
            <Typewriter
              key={firstName}
              component="span"
              options={{
                strings: [firstName],
                autoStart: true,
                loop: false,
                delay: 50,
                deleteSpeed: Infinity,
                cursor: '',
              }}
            />
          </span>
          <Image src="/icons/wave-2.png" alt="" width={24} height={24} className="h-6 w-6" />
        </h2>
        <p className="mt-2 text-sm text-fg-muted">Here&apos;s what&apos;s happening with your reconciliations today.</p>
      </div>

      <button
        type="button"
        onClick={() => router.push('/dashboard/reconcile?upload=1')}
        className="flex shrink-0 cursor-pointer items-center gap-2 self-end rounded-lg bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-90 active:scale-95 sm:self-auto"
      >
        <Plus className="h-4 w-4" />
        Start New Reconciliation
      </button>
    </div>
  )
}
