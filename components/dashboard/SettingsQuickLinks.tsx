'use client'

import { useRouter } from 'next/navigation'
import { Bell, ChevronRight, Users } from 'lucide-react'

const links = [
  { label: 'Manage Users', description: 'Add and manage team members', Icon: Users, href: '/dashboard/team' },
  { label: 'Notification Settings', description: 'Configure email and alerts', Icon: Bell, anchor: 'notification-settings' },
] as const

// Same box-shadow-only flash as AuditLogTable's "View All Actions" — direct
// DOM manipulation rather than lifted state, since this link already reaches
// its target by raw getElementById rather than through props.
const HIGHLIGHT_CLASSES = ['shadow-[0_0_0_3px_rgba(28,234,234,0.5)]']

export default function SettingsQuickLinks() {
  const router = useRouter()

  const handleClick = (link: (typeof links)[number]) => {
    if ('href' in link) {
      router.push(link.href)
      return
    }
    const el = document.getElementById(link.anchor)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    el.classList.add(...HIGHLIGHT_CLASSES)
    window.setTimeout(() => el.classList.remove(...HIGHLIGHT_CLASSES), 1500)
  }

  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0A1121]/60 p-3">
      <h3 className="text-lg font-semibold text-white">Quick Links</h3>

      <div className="mt-1">
        {links.map((link) => (
          <button
            key={link.label}
            type="button"
            onClick={() => handleClick(link)}
            className="flex w-full cursor-pointer rounded-xl hover:p-2 items-center gap-3 py-2 text-left transition-colors hover:bg-white/5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-300">
              <link.Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-white">{link.label}</span>
              <span className="block truncate text-xs text-slate-400">{link.description}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
          </button>
        ))}
      </div>
    </div>
  )
}
