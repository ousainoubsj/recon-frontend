import { Bell, Mail, ShieldCheck, Trash2, UserCheck, UserX, type LucideIcon } from 'lucide-react'

// The only two categories any real backend notification type maps to today
// (see NOTIFICATION_DISPLAY below) — the mock UI's 'filesUploads'/'mentions'
// tabs were dropped since no @-mention or file-upload-failure notification
// exists server-side to ever populate them.
export type NotificationCategory = 'reconciliations' | 'systemAlerts'

type NotificationDisplay = {
  title: string
  Icon: LucideIcon
  iconTint: string
  tagTint: string
  category: NotificationCategory
}

// Every real `type` string ever passed to createNotification(...) across the
// backend (grepped from services/*.js) — keep in sync if a new call site is
// added there.
const NOTIFICATION_DISPLAY: Record<string, NotificationDisplay> = {
  'organization.weekly_digest_sent': {
    title: 'Weekly Digest Sent',
    Icon: Mail,
    iconTint: 'bg-indigo-500/15 text-indigo-400',
    tagTint: 'bg-indigo-500/15 text-indigo-300',
    category: 'systemAlerts',
  },
  'report.deleted_by_admin': {
    title: 'Report Deleted',
    Icon: Trash2,
    iconTint: 'bg-rose-500/15 text-rose-400',
    tagTint: 'bg-rose-500/15 text-rose-300',
    category: 'reconciliations',
  },
  'member.role_changed': {
    title: 'Role Updated',
    Icon: ShieldCheck,
    iconTint: 'bg-violet-500/15 text-violet-400',
    tagTint: 'bg-violet-500/15 text-violet-300',
    category: 'systemAlerts',
  },
  'invitation.accepted': {
    title: 'Invitation Accepted',
    Icon: UserCheck,
    iconTint: 'bg-emerald-500/15 text-emerald-400',
    tagTint: 'bg-emerald-500/15 text-emerald-300',
    category: 'systemAlerts',
  },
  'member.deactivated': {
    title: 'Account Deactivated',
    Icon: UserX,
    iconTint: 'bg-amber-500/15 text-amber-400',
    tagTint: 'bg-amber-500/15 text-amber-300',
    category: 'systemAlerts',
  },
}

const FALLBACK_DISPLAY: Omit<NotificationDisplay, 'title'> = {
  Icon: Bell,
  iconTint: 'bg-slate-500/15 text-slate-400',
  tagTint: 'bg-slate-500/15 text-slate-300',
  category: 'systemAlerts',
}

const ENTITY_TAG_LABEL: Record<string, string> = {
  organization: 'Organization',
  report: 'Report',
  member: 'Member',
  invitation: 'Invitation',
}

// Same fallback convention as ActivityOverview.tsx's humanizeAction — turns
// an unmapped 'foo.bar_baz' into 'Foo Bar Baz' so a future notification type
// added server-side without a matching entry here still reads sensibly.
function humanizeType(type: string) {
  return type.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function notificationDisplay(type: string): NotificationDisplay {
  return NOTIFICATION_DISPLAY[type] ?? { ...FALLBACK_DISPLAY, title: humanizeType(type) }
}

export function notificationTag(entityType: string | null): string | null {
  if (!entityType) return null
  return ENTITY_TAG_LABEL[entityType] ?? entityType
}

const clockTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

// "2m ago" / "45m ago" / "1h ago" for today, "Yesterday, 11:15 PM" for
// yesterday, a short date beyond that — matches the design reference's exact
// time-column wording (deliberately more compact than lib/format.ts's
// formatRelativeTime/formatTimeAgo, which spell out "2 minutes ago").
export function formatNotificationTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000)
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dayDiff = Math.round((startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / (24 * 60 * 60 * 1000))

  if (dayDiff === 1) return `Yesterday, ${clockTime(date)}`
  if (dayDiff > 1) return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}, ${clockTime(date)}`
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  return `${Math.floor(diffMinutes / 60)}h ago`
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Groups notifications by calendar day the way the design reference does
// ("Today" / "Yesterday"), generalized to a short date for anything older —
// the mock only ever showed the first two buckets.
export function notificationGroupLabel(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dayDiff = Math.round((startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / (24 * 60 * 60 * 1000))

  if (dayDiff === 0) return 'Today'
  if (dayDiff === 1) return 'Yesterday'
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}
