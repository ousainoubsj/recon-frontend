'use client'

import { useState } from 'react'
import {
  AtSign,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  Mail,
  MoreVertical,
  ShieldCheck,
  SlidersHorizontal,
  UploadCloud,
  type LucideIcon,
} from 'lucide-react'

type Category = 'reconciliations' | 'systemAlerts' | 'filesUploads' | 'mentions'
type Group = 'Today' | 'Yesterday'

type MockNotification = {
  id: string
  group: Group
  category: Category
  title: string
  description: string
  tag: string
  tagTint: string
  Icon: LucideIcon
  iconTint: string
  time: string
  read: boolean
}

// Mock data — matches the design reference exactly. No GET /notifications
// list-fetching wired up yet; swap this array for a real query once the
// backend list endpoint gets a frontend caller.
const INITIAL_NOTIFICATIONS: MockNotification[] = [
  {
    id: 't1',
    group: 'Today',
    category: 'reconciliations',
    title: 'Reconciliation completed',
    description: 'Monthly Bank Reconciliation has been completed successfully.',
    tag: 'Monthly Bank Reconciliation',
    tagTint: 'bg-indigo-500/15 text-indigo-300',
    Icon: FileText,
    iconTint: 'bg-indigo-500/15 text-indigo-400',
    time: '2m ago',
    read: false,
  },
  {
    id: 't2',
    group: 'Today',
    category: 'reconciliations',
    title: 'Visa Card Settlement completed',
    description: 'May 2024 settlement was completed successfully.',
    tag: 'Visa Card Settlement',
    tagTint: 'bg-emerald-500/15 text-emerald-300',
    Icon: CheckCircle2,
    iconTint: 'bg-emerald-500/15 text-emerald-400',
    time: '45m ago',
    read: false,
  },
  {
    id: 't3',
    group: 'Today',
    category: 'mentions',
    title: 'John Doe mentioned you',
    description: '@Ousainou please review the mapping changes for "Cashbook vs Ledger".',
    tag: 'Cashbook vs Ledger',
    tagTint: 'bg-amber-500/15 text-amber-300',
    Icon: AtSign,
    iconTint: 'bg-amber-500/15 text-amber-400',
    time: '1h ago',
    read: false,
  },
  {
    id: 't4',
    group: 'Today',
    category: 'filesUploads',
    title: 'File upload failed',
    description: 'Failed to upload "ledger_may.xlsx". Please check the file and try again.',
    tag: 'File Upload',
    tagTint: 'bg-rose-500/15 text-rose-300',
    Icon: UploadCloud,
    iconTint: 'bg-rose-500/15 text-rose-400',
    time: '2h ago',
    read: false,
  },
  {
    id: 't5',
    group: 'Today',
    category: 'systemAlerts',
    title: 'Scheduled report ready',
    description: 'Your scheduled report "Daily Reconciliation Summary" is ready.',
    tag: 'Daily Reconciliation',
    tagTint: 'bg-blue-500/15 text-blue-300',
    Icon: Bell,
    iconTint: 'bg-blue-500/15 text-blue-400',
    time: '3h ago',
    read: false,
  },
  {
    id: 'y1',
    group: 'Yesterday',
    category: 'systemAlerts',
    title: 'Report emailed to 3 recipients',
    description: 'Monthly Reconciliation Report has been sent to 3 recipients.',
    tag: 'Monthly Reconciliation Report',
    tagTint: 'bg-indigo-500/15 text-indigo-300',
    Icon: Mail,
    iconTint: 'bg-indigo-500/15 text-indigo-400',
    time: 'Yesterday, 11:15 PM',
    read: true,
  },
  {
    id: 'y2',
    group: 'Yesterday',
    category: 'filesUploads',
    title: 'File uploaded successfully',
    description: '"bank_statement_june.pdf" has been uploaded successfully.',
    tag: 'File Upload',
    tagTint: 'bg-blue-500/15 text-blue-300',
    Icon: UploadCloud,
    iconTint: 'bg-blue-500/15 text-blue-400',
    time: 'Yesterday, 10:04 PM',
    read: true,
  },
  {
    id: 'y3',
    group: 'Yesterday',
    category: 'systemAlerts',
    title: 'New sign-in detected',
    description: 'New sign-in detected from Chrome on Windows.',
    tag: 'Security Alert',
    tagTint: 'bg-emerald-500/15 text-emerald-300',
    Icon: ShieldCheck,
    iconTint: 'bg-emerald-500/15 text-emerald-400',
    time: 'Yesterday, 9:21 PM',
    read: true,
  },
]

const TABS: { key: Category; label: string; Icon: LucideIcon; iconColor: string; count: number }[] = [
  { key: 'reconciliations', label: 'Reconciliations', Icon: ShieldCheck, iconColor: 'text-emerald-400', count: 12 },
  { key: 'systemAlerts', label: 'System Alerts', Icon: Bell, iconColor: 'text-amber-400', count: 6 },
  { key: 'filesUploads', label: 'Files & Uploads', Icon: UploadCloud, iconColor: 'text-sky-400', count: 5 },
  { key: 'mentions', label: 'Mentions', Icon: AtSign, iconColor: 'text-violet-400', count: 4 },
]

const GROUP_ORDER: Group[] = ['Today', 'Yesterday']

export default function NotificationsPageClient() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [activeTab, setActiveTab] = useState<Category | 'all'>('all')

  const markAllAsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  const markAsRead = (id: string) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))

  const filtered = activeTab === 'all' ? notifications : notifications.filter((n) => n.category === activeTab)
  const groups = GROUP_ORDER.map((group) => ({ group, items: filtered.filter((n) => n.group === group) })).filter(
    ({ items }) => items.length > 0,
  )

  return (
    <div className="flex-1 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="mt-1 text-sm text-[#A3B2C8]">Stay updated on your reconciliations and system activity.</p>
          </div>
          <button
            type="button"
            onClick={markAllAsRead}
            className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-indigo-500/40 px-4 py-2 text-sm font-medium text-indigo-400 transition-all duration-300 hover:bg-indigo-500/10 active:scale-95"
          >
            <Check className="h-4 w-4" />
            Mark all as read
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-[#232D47] bg-[#0A1121]/60 p-3">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 active:scale-95 ${
              activeTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            All
          </button>
          {TABS.map(({ key, label, Icon, iconColor, count }) => (
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
                {count}
              </span>
            </button>
          ))}
          <button
            type="button"
            className="ml-auto flex cursor-pointer items-center gap-2 rounded-lg border border-[#232D47] px-3 py-2 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-white/5 active:scale-95"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        {groups.length === 0 ? (
          <p className="mt-10 text-center text-sm text-slate-400">No notifications in this category.</p>
        ) : (
          groups.map(({ group, items }) => (
            <div key={group} className="mt-6">
              <p className="mb-3 text-sm font-medium text-slate-400">{group}</p>
              <div className="space-y-3">
                {items.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className="flex cursor-pointer items-start gap-4 rounded-xl border border-[#232D47] bg-[#0D152A]/50 p-4 transition-all duration-300 hover:bg-white/5"
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${notification.iconTint}`}>
                      <notification.Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">{notification.title}</p>
                      <p className="mt-0.5 text-sm text-slate-400">{notification.description}</p>
                      <span className={`mt-2 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${notification.tagTint}`}>
                        {notification.tag}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="whitespace-nowrap text-xs text-slate-500">{notification.time}</span>
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
                ))}
              </div>
            </div>
          ))
        )}

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-indigo-400 transition-all duration-300 hover:text-indigo-300 active:scale-95"
          >
            Load more notifications
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
