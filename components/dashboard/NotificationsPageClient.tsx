'use client'

import { useState } from 'react'
import { Bell, Check, ChevronDown, MoreVertical, ShieldCheck, type LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotificationsList } from '@/lib/hooks/useNotifications'
import { formatNotificationTime, notificationDisplay, notificationGroupLabel, notificationTag, type NotificationCategory } from '@/lib/notificationDisplay'

const TABS: { key: NotificationCategory; label: string; Icon: LucideIcon; iconColor: string }[] = [
  { key: 'reconciliations', label: 'Reconciliations', Icon: ShieldCheck, iconColor: 'text-emerald-400' },
  { key: 'systemAlerts', label: 'System Alerts', Icon: Bell, iconColor: 'text-amber-400' },
]

// Same "dark card + cyan-gradient checkmark badge" composition as
// ActivityOverview.tsx's EmptyReconciliations/EmptyActivity — two mock
// notification cards standing in for the (now empty) list, badge signals
// "you're all caught up" the same way EmptyReconciliations's badge does.
function EmptyNotifications({ message }: { message: string }) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center gap-4 py-6 text-center">
      <svg width="112" height="88" viewBox="0 0 112 88" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="emptyNotificationsGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="#1CEAEA" />
          </linearGradient>
        </defs>
        <g transform="rotate(-8 30 40)">
          <rect x="12" y="14" width="36" height="48" rx="6" fill="#111A33" stroke="#232D47" strokeWidth="1.5" />
          <circle cx="21" cy="24" r="4" fill="#2C3654" />
          <rect x="29" y="21.5" width="14" height="3" rx="1.5" fill="#3A4568" />
          <rect x="19" y="34" width="24" height="2.5" rx="1.25" fill="#2C3654" />
          <rect x="19" y="40" width="18" height="2.5" rx="1.25" fill="#2C3654" />
        </g>
        <g transform="rotate(8 82 40)">
          <rect x="64" y="10" width="36" height="48" rx="6" fill="#0D152A" stroke="#1CEAEA" strokeOpacity="0.35" strokeWidth="1.5" />
          <circle cx="73" cy="20" r="4" fill="#1CEAEA" fillOpacity="0.5" />
          <rect x="81" y="17.5" width="14" height="3" rx="1.5" fill="#1CEAEA" fillOpacity="0.5" />
          <rect x="71" y="30" width="24" height="2.5" rx="1.25" fill="#2C3654" />
          <rect x="71" y="36" width="18" height="2.5" rx="1.25" fill="#2C3654" />
        </g>
        <circle cx="56" cy="66" r="16" fill="#0A1128" stroke="#232D47" strokeWidth="1.5" />
        <path
          d="M49 66.5 L53.5 71 L63.5 61"
          stroke="url(#emptyNotificationsGlow)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <div>
        <p className="text-sm font-medium text-slate-200">You&apos;re all caught up</p>
        <p className="mt-1 text-xs text-slate-400">{message}</p>
      </div>
    </div>
  )
}

// "Load more" reveals another page of the already-fetched list — GET
// /notifications has no offset/limit param server-side, so pagination here
// is a client-side slice rather than a re-fetch.
const PAGE_SIZE = 5

export default function NotificationsPageClient() {
  const { data: notifications, isLoading } = useNotificationsList()
  const markAllAsRead = useMarkAllNotificationsRead()
  const markAsRead = useMarkNotificationRead()

  const [activeTab, setActiveTab] = useState<NotificationCategory | 'all'>('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Reset the page size whenever the tab changes, without a useEffect+setState
  // round-trip — same render-time-adjustment pattern used elsewhere in this
  // app (e.g. ProfileDialog's open-triggered field reset).
  const [prevActiveTab, setPrevActiveTab] = useState(activeTab)
  if (activeTab !== prevActiveTab) {
    setPrevActiveTab(activeTab)
    setVisibleCount(PAGE_SIZE)
  }

  const all = notifications ?? []
  const tabCounts = Object.fromEntries(TABS.map(({ key }) => [key, all.filter((n) => notificationDisplay(n.type).category === key).length]))
  const filtered = activeTab === 'all' ? all : all.filter((n) => notificationDisplay(n.type).category === activeTab)
  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const groupOrder = [...new Set(visible.map((n) => notificationGroupLabel(n.createdAt)))]
  const groups = groupOrder.map((group) => ({ group, items: visible.filter((n) => notificationGroupLabel(n.createdAt) === group) }))

  return (
    <div className="flex-1 p-6">
      <div className="mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="mt-1 text-sm text-[#A3B2C8]">Stay updated on your reconciliations and system activity.</p>
          </div>
          <button
            type="button"
            onClick={() => markAllAsRead.mutate()}
            className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-indigo-500/40 px-4 py-2 text-sm font-medium text-indigo-400 transition-all duration-300 hover:bg-indigo-500/10 active:scale-95"
          >
            <Check className="h-4 w-4" />
            Mark all as read
          </button>
        </div>

        <div className="mt-6 max-w-md flex flex-wrap items-center gap-2 rounded-2xl border border-[#232D47] bg-[#0A1121]/60 p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 active:scale-95 ${
              activeTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            All
          </button>
          {TABS.map(({ key, label, Icon, iconColor }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 active:scale-95 ${
                activeTab === key ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Icon className={`h-4 w-4 ${activeTab === key ? 'text-white' : iconColor}`} />
              {label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === key ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
                }`}
              >
                {tabCounts[key]}
              </span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 rounded-xl border border-[#232D47] bg-[#0D152A]/50 p-4">
                <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-64" />
                  <Skeleton className="h-4 w-32 rounded-md" />
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <EmptyNotifications message={activeTab === 'all' ? 'You have no notifications yet.' : 'No notifications in this category.'} />
        ) : (
          groups.map(({ group, items }) => (
            <div key={group} className="mt-6">
              <p className="mb-3 text-sm font-medium text-slate-400">{group}</p>
              <div className="space-y-3">
                {items.map((notification) => {
                  const { title, Icon, iconTint, tagTint } = notificationDisplay(notification.type)
                  const tag = notificationTag(notification.entityType)
                  return (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead.mutate(notification.id)}
                      className="flex cursor-pointer items-start gap-4 rounded-xl border border-[#232D47] bg-[#0D152A]/50 p-4 transition-all duration-300 hover:bg-white/5"
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconTint}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="mt-0.5 text-sm text-slate-400">{notification.message}</p>
                        {tag && <span className={`mt-2 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${tagTint}`}>{tag}</span>}
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="whitespace-nowrap text-xs text-slate-500">{formatNotificationTime(notification.createdAt)}</span>
                        {notification.read ? (
                          <span className="h-2 w-2 shrink-0 rounded-full border border-slate-500" />
                        ) : (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                        )}
                        <button
                          type="button"
                          aria-label="More options"
                          onClick={(e) => e.stopPropagation()}
                          className="cursor-pointer rounded-md p-1 text-slate-500 transition-all duration-300 hover:bg-white/10 hover:text-white active:scale-95"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}

        {hasMore && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-indigo-400 transition-all duration-300 hover:text-indigo-300 active:scale-95"
            >
              Load more notifications
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
