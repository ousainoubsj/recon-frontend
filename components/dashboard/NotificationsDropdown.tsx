'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Bell } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotificationsList, useUnreadCount } from '@/lib/hooks/useNotifications'
import { formatNotificationTime, notificationDisplay } from '@/lib/notificationDisplay'

// Dropdown shows the 5 most recent notifications — GET /notifications has no
// limit param, so this slices the same full list the notifications page
// fetches (React Query dedupes the two callers onto one request/cache entry).
const PREVIEW_COUNT = 5

export default function NotificationsDropdown() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { data: unreadCountData } = useUnreadCount()
  const unreadCount = unreadCountData?.count ?? 0
  const { data: notifications, isLoading } = useNotificationsList()
  const markAllAsRead = useMarkAllNotificationsRead()
  const markAsRead = useMarkNotificationRead()

  const preview = notifications?.slice(0, PREVIEW_COUNT) ?? []

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
            onClick={() => markAllAsRead.mutate()}
            className="shrink-0 cursor-pointer text-xs font-medium text-indigo-400 transition-all duration-300 hover:text-indigo-300 active:scale-95"
          >
            Mark all as read
          </button>
        </div>

        {isLoading ? (
          <ul className="px-2">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex items-start gap-3 px-2 py-2.5">
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </li>
            ))}
          </ul>
        ) : preview.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">No notifications yet.</p>
        ) : (
          <ul className="max-h-96 overflow-y-auto px-2">
            {preview.map((notification) => {
              const { title, Icon, iconTint } = notificationDisplay(notification.type)
              return (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => markAsRead.mutate(notification.id)}
                    className="flex w-full cursor-pointer items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-all duration-300 hover:bg-white/5 active:scale-[0.99]"
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconTint}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-white">{title}</p>
                        <span className="shrink-0 whitespace-nowrap text-xs text-slate-500">{formatNotificationTime(notification.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{notification.message}</p>
                    </div>
                    {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

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
