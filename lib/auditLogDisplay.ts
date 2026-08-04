import {
  Bell,
  Building2,
  CheckCircle2,
  CirclePlus,
  ClipboardCheck,
  Columns3,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  LogIn,
  Mail,
  PlayCircle,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Upload,
  UserCheck,
  UserCog,
  UserMinus,
  UserPlus,
  UserX,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import type { AuditLog } from '@/types/auditLogs'

// Every real audit-log module this app produces, in the order the original
// mock's filter dropdown listed them — "Team" and "Settings" are additions
// (the mock predates those actions existing at all).
export const MODULES = ['Reconciliation', 'Mapping', 'Processing', 'Results', 'Reports', 'Authentication', 'Team', 'Settings'] as const
export type ModuleName = (typeof MODULES)[number]

export const MODULE_BADGE_CLASSNAME: Record<ModuleName, string> = {
  Reconciliation: 'bg-indigo-500/15 text-indigo-300',
  Mapping: 'bg-sky-500/15 text-sky-300',
  Processing: 'bg-amber-500/15 text-amber-300',
  Results: 'bg-emerald-500/15 text-emerald-300',
  Reports: 'bg-sky-500/15 text-sky-300',
  Authentication: 'bg-slate-500/15 text-slate-300',
  Team: 'bg-cyan-500/15 text-cyan-300',
  Settings: 'bg-orange-500/15 text-orange-300',
}

type ActionDisplay = { title: string; Icon: LucideIcon; iconBg: string; iconColor: string; module: ModuleName }

export const ACTION_DISPLAY: Record<string, ActionDisplay> = {
  'report.create': { title: 'Reconciliation Created', Icon: CirclePlus, iconBg: 'bg-indigo-500/15', iconColor: 'text-indigo-400', module: 'Reconciliation' },
  'report.delete': { title: 'Reconciliation Deleted', Icon: Trash2, iconBg: 'bg-rose-500/15', iconColor: 'text-rose-400', module: 'Reconciliation' },
  'report.bulk_delete': { title: 'Bulk Deleted Reconciliations', Icon: Trash2, iconBg: 'bg-rose-500/15', iconColor: 'text-rose-400', module: 'Reconciliation' },
  'file.upload_initiated': { title: 'Files Uploaded', Icon: Upload, iconBg: 'bg-indigo-500/15', iconColor: 'text-indigo-400', module: 'Reconciliation' },
  'report.column_mapping.updated': { title: 'Column Mapping Updated', Icon: Columns3, iconBg: 'bg-sky-500/15', iconColor: 'text-sky-400', module: 'Mapping' },
  'report.matching_rules.updated': { title: 'Matching Rules Modified', Icon: SlidersHorizontal, iconBg: 'bg-sky-500/15', iconColor: 'text-sky-400', module: 'Mapping' },
  'report.run.started': { title: 'Reconciliation Processing Started', Icon: PlayCircle, iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400', module: 'Processing' },
  'report.run.completed': { title: 'Reconciliation Processing Completed', Icon: CheckCircle2, iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400', module: 'Processing' },
  'report.run.failed': { title: 'Reconciliation Processing Failed', Icon: XCircle, iconBg: 'bg-rose-500/15', iconColor: 'text-rose-400', module: 'Processing' },
  'report.results.viewed': { title: 'Viewed Reconciliation Results', Icon: Eye, iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400', module: 'Results' },
  'report.row.review': { title: 'Transaction Reviewed', Icon: ClipboardCheck, iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400', module: 'Results' },
  'report.export': { title: 'Exported Report', Icon: Download, iconBg: 'bg-sky-500/15', iconColor: 'text-sky-400', module: 'Reports' },
  'report.bulk_export': { title: 'Bulk Exported Reports', Icon: Download, iconBg: 'bg-sky-500/15', iconColor: 'text-sky-400', module: 'Reports' },
  'report.email': { title: 'Emailed Report', Icon: Mail, iconBg: 'bg-indigo-500/15', iconColor: 'text-indigo-400', module: 'Reports' },
  'auth.login': { title: 'User Login', Icon: LogIn, iconBg: 'bg-slate-500/15', iconColor: 'text-slate-300', module: 'Authentication' },
  'auth.login_failed': { title: 'Login Failed', Icon: ShieldAlert, iconBg: 'bg-rose-500/15', iconColor: 'text-rose-400', module: 'Authentication' },
  'member.update': { title: 'Team Member Updated', Icon: UserCog, iconBg: 'bg-cyan-500/15', iconColor: 'text-cyan-400', module: 'Team' },
  'team.department.create': { title: 'Department Created', Icon: Building2, iconBg: 'bg-teal-500/15', iconColor: 'text-teal-400', module: 'Team' },
  'organization.member.invite': { title: 'Invited Team Member', Icon: UserPlus, iconBg: 'bg-sky-500/15', iconColor: 'text-sky-400', module: 'Team' },
  'organization.member.remove': { title: 'Removed Team Member', Icon: UserMinus, iconBg: 'bg-rose-500/15', iconColor: 'text-rose-400', module: 'Team' },
  'organization.member.role_update': { title: 'Updated Member Role', Icon: ShieldCheck, iconBg: 'bg-violet-500/15', iconColor: 'text-violet-400', module: 'Team' },
  'organization.invitation.accept': { title: 'Invitation Accepted', Icon: UserCheck, iconBg: 'bg-green-500/15', iconColor: 'text-green-400', module: 'Team' },
  'organization.invitation.cancel': { title: 'Invitation Canceled', Icon: UserX, iconBg: 'bg-pink-500/15', iconColor: 'text-pink-400', module: 'Team' },
  'organization.delete': { title: 'Organization Deleted', Icon: Trash2, iconBg: 'bg-rose-500/15', iconColor: 'text-rose-400', module: 'Settings' },
  'settings.organization_info.update': { title: 'Updated Organization Information', Icon: LayoutGrid, iconBg: 'bg-orange-500/15', iconColor: 'text-orange-400', module: 'Settings' },
  'settings.reconciliation_defaults.update': { title: 'Updated Reconciliation Defaults', Icon: SlidersHorizontal, iconBg: 'bg-fuchsia-500/15', iconColor: 'text-fuchsia-400', module: 'Settings' },
  'settings.notifications.update': { title: 'Updated Notification Settings', Icon: Bell, iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400', module: 'Settings' },
  'settings.avatar.presign_requested': { title: 'Avatar Upload Requested', Icon: ImageIcon, iconBg: 'bg-purple-500/15', iconColor: 'text-purple-400', module: 'Settings' },
}

// 'organization.update' (Better Auth's own hook) covers both a name change
// and a logo change — same metadata-based disambiguation used in
// ActivityOverview.tsx/SettingsRecentActivity.tsx, kept in sync with both.
const ORG_UPDATE_NAME_DISPLAY: ActionDisplay = {
  title: 'Updated Organization Profile',
  Icon: LayoutGrid,
  iconBg: 'bg-orange-500/15',
  iconColor: 'text-orange-400',
  module: 'Settings',
}
const ORG_UPDATE_LOGO_DISPLAY: ActionDisplay = {
  title: 'Updated Organization Logo',
  Icon: ImageIcon,
  iconBg: 'bg-emerald-500/15',
  iconColor: 'text-emerald-400',
  module: 'Settings',
}

// report.delete covers both a finished reconciliation and an unfinished
// draft (e.g. "Remove Draft" in ReconciliationRecentActivity.tsx) — same
// metadata-based disambiguation as organization.update above.
const DRAFT_DELETE_DISPLAY: ActionDisplay = {
  title: 'Draft Deleted',
  Icon: Trash2,
  iconBg: 'bg-rose-500/15',
  iconColor: 'text-rose-400',
  module: 'Reconciliation',
}

function humanizeAction(action: string) {
  return action.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function actionDisplay(log: Pick<AuditLog, 'action' | 'metadata'>): ActionDisplay {
  if (log.action === 'organization.update') {
    const hasLogo = !!log.metadata && typeof log.metadata === 'object' && 'logo' in log.metadata
    return hasLogo ? ORG_UPDATE_LOGO_DISPLAY : ORG_UPDATE_NAME_DISPLAY
  }
  if (log.action === 'report.delete') {
    const wasDraft = !!log.metadata && typeof log.metadata === 'object' && (log.metadata as { wasDraft?: boolean }).wasDraft === true
    if (wasDraft) return DRAFT_DELETE_DISPLAY
  }
  return (
    ACTION_DISPLAY[log.action] ?? {
      title: humanizeAction(log.action),
      Icon: FileText,
      iconBg: 'bg-slate-500/15',
      iconColor: 'text-slate-300',
      module: 'Settings',
    }
  )
}

function humanizeKey(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^\w/, (c) => c.toUpperCase())
}

function formatMetaValue(value: unknown): string {
  if (value == null) return 'None'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

// Best-effort human-readable detail lines from whatever shape this action's
// metadata happens to carry — settings-style {changes:{field:{from,to}}}
// diffs get the same treatment as SettingsRecentActivity.tsx's describeMetadata,
// everything else falls back to a plain key: value listing. Shared by
// AuditLogTable's Details column and AuditSidebar's Log Details card.
export function detailsForLog(log: Pick<AuditLog, 'metadata'>): string[] {
  const metadata = log.metadata
  if (!metadata) return []

  const changes = metadata.changes
  if (changes && typeof changes === 'object') {
    return Object.entries(changes as Record<string, { from: unknown; to: unknown }>).map(
      ([field, { from, to }]) => `${humanizeKey(field)}: ${formatMetaValue(from)} → ${formatMetaValue(to)}`,
    )
  }

  const entries = Object.entries(metadata).filter(([, v]) => v !== undefined)
  return entries.slice(0, 2).map(([key, value]) => `${humanizeKey(key)}: ${formatMetaValue(value)}`)
}

// Inverse of ACTION_DISPLAY, for the Module filter dropdown — picking a
// module sends its full list of real action strings as the `action` filter
// (the list endpoint already accepts `action` as an array).
export const MODULE_ACTIONS: Record<ModuleName, string[]> = MODULES.reduce(
  (acc, module) => {
    acc[module] = Object.entries(ACTION_DISPLAY)
      .filter(([, display]) => display.module === module)
      .map(([action]) => action)
    return acc
  },
  {} as Record<ModuleName, string[]>,
)
// 'organization.update' is dynamically disambiguated (name vs logo) so it
// isn't a key of ACTION_DISPLAY, but still belongs in the Settings filter.
MODULE_ACTIONS.Settings = [...MODULE_ACTIONS.Settings, 'organization.update']
