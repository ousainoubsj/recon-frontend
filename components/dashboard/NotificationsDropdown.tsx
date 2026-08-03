'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Bell, CalendarCheck2, CheckCircle2, FileText, UploadCloud, User, type LucideIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type MockNotification = {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  Icon: LucideIcon
  tint: string
}

// Mock data — matches the design reference exactly. Neither GET /notifications
// nor /notifications/unread-count has a frontend caller yet; the badge count
// below is derived from this same array so the badge and list stay in sync
// until both get wired to the real endpoints.
const INITIAL_NOTIFICATIONS: MockNotification[] = [
  {
    id: '1',
    title: 'Reconciliation completed',
    description: 'Monthly Bank Reconciliation has been completed successfully.',
    time: '2m ago',
    read: false,
    Icon: FileText,
    tint: 'bg-indigo-500/15 text-indigo-400',
  },
  {
    id: '2',
    title: 'Visa Card Settlement completed',
    description: 'May 2024 settlement was completed successfully.',
    time: '45m ago',
    read: false,
    Icon: CheckCircle2,
    tint: 'bg-emerald-500/15 text-emerald-400',
  },
  {
    id: '3',
    title: 'John Doe mentioned you',
    description: '@Ousainou please review the mapping changes for "Cashbook vs Ledger".',
    time: '1h ago',
    read: false,
    Icon: User,
    tint: 'bg-amber-500/15 text-amber-400',
  },
  {
    id: '4',
    title: 'File upload failed',
    description: 'Failed to upload "ledger_may.xlsx". Please check the file and try again.',
    time: '2h ago',
    read: false,
    Icon: UploadCloud,
    tint: 'bg-rose-500/15 text-rose-400',
  },
  {
    id: '5',
    title: 'Scheduled report ready',
    description: 'Your scheduled report "Daily Reconciliation Summary" is ready.',
    time: 'Yesterday',
    read: false,
    Icon: CalendarCheck2,
    tint: 'bg-blue-500/15 text-blue-400',
  },
]

export default function NotificationsDropdown() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  const markAsRead = (id: string) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  const viewAll = () => {
    setOpen(false)
    router.push('/dashboard/notifications')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Notifications"
        className="relative cursor-pointer text-slate-400 transition-colors duration-300 hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1CEAEA] text-[10px] font-semibold text-[#050F20]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={12} className="w-96 p-0">
        <div className="flex items-center justify-between gap-4 px-4 pt-4 pb-3">
          <h3 className="text-base font-semibold text-white">Notifications</h3>
          <button
            type="button"
            onClick={markAllAsRead}
            className="shrink-0 cursor-pointer text-xs font-medium text-indigo-400 transition-all duration-300 hover:text-indigo-300 active:scale-95"
          >
            Mark all as read
          </button>
        </div>

        <ul className="max-h-96 overflow-y-auto px-2">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <button
                type="button"
                onClick={() => markAsRead(notification.id)}
                className="flex w-full cursor-pointer items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-all duration-300 hover:bg-white/5 active:scale-[0.99]"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${notification.tint}`}>
                  <notification.Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-white">{notification.title}</p>
                    <span className="shrink-0 whitespace-nowrap text-xs text-slate-500">{notification.time}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{notification.description}</p>
                </div>
                {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />}
              </button>
            </li>
          ))}
        </ul>

        <div className="border-t border-[#1B2540] px-4 py-3">
          <button
            type="button"
            onClick={viewAll}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 text-sm font-medium text-indigo-400 transition-all duration-300 hover:text-indigo-300 active:scale-95"
          >
            View all notifications
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
