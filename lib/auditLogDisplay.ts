import {
  BadgeCheck,
  BellRing,
  BookX,
  Building2,
  CircleCheckBig,
  CircleHelp,
  CircleUserRound,
  CircleX,
  ClipboardCheck,
  ClipboardX,
  Columns3,
  Earth,
  Eye,
  FileCheck2,
  FileDown,
  FileMinus,
  FileWarning,
  FileX2,
  FolderDown,
  GitCompareArrows,
  ImagePlus,
  ImageUp,
  LayoutTemplate,
  Link2,
  ListMinus,
  ListPlus,
  ListX,
  LogIn,
  Mail,
  MailPlus,
  MailX,
  MessageSquareText,
  Network,
  OctagonX,
  PencilLine,
  PlayCircle,
  RotateCcw,
  Settings2,
  ShieldAlert,
  ShieldBan,
  ShieldCheck,
  SlidersHorizontal,
  SlidersVertical,
  Tag,
  TextCursorInput,
  Trash2,
  Undo2,
  Upload,
  UserCheck,
  UserCog,
  UserMinus,
  UserPlus,
  UserRoundCheck,
  UserX,
  type LucideIcon,
} from 'lucide-react'
import { formatFileSize, formatNumber } from '@/lib/format'
import { ROLE_LABELS, type MemberRole } from '@/types/team'
import type { AuditLog } from '@/types/auditLogs'

/** Every module this audit trail produces, in filter-dropdown order. */
export const MODULES = [
  'Reconciliation',
  'Mapping',
  'Processing',
  'Results',
  'Reports',
  'Templates',
  'Authentication',
  'Team',
  'Settings',
] as const
export type ModuleName = (typeof MODULES)[number]

// One distinct hue per module so no two Module badges read as the same colour.
export const MODULE_BADGE_CLASSNAME: Record<ModuleName, string> = {
  Reconciliation: 'bg-indigo-500/15 text-indigo-300',
  Mapping: 'bg-sky-500/15 text-sky-300',
  Processing: 'bg-amber-500/15 text-amber-300',
  Results: 'bg-emerald-500/15 text-emerald-300',
  Reports: 'bg-violet-500/15 text-violet-300',
  Templates: 'bg-lime-500/15 text-lime-300',
  Authentication: 'bg-pink-500/15 text-pink-300',
  Team: 'bg-cyan-500/15 text-cyan-300',
  Settings: 'bg-orange-500/15 text-orange-300',
}

type Tone = { iconBg: string; iconColor: string; solid: string }

// Full class strings written once each so Tailwind's scanner sees them; `solid` is the dashboard feed's filled circle.
const TONE = {
  indigo: { iconBg: 'bg-indigo-500/15', iconColor: 'text-indigo-400', solid: 'bg-indigo-500 text-white' },
  sky: { iconBg: 'bg-sky-500/15', iconColor: 'text-sky-400', solid: 'bg-sky-500 text-white' },
  amber: { iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400', solid: 'bg-amber-500 text-white' },
  emerald: { iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400', solid: 'bg-emerald-500 text-white' },
  violet: { iconBg: 'bg-violet-500/15', iconColor: 'text-violet-400', solid: 'bg-violet-500 text-white' },
  lime: { iconBg: 'bg-lime-500/15', iconColor: 'text-lime-400', solid: 'bg-lime-600 text-white' },
  pink: { iconBg: 'bg-pink-500/15', iconColor: 'text-pink-400', solid: 'bg-pink-500 text-white' },
  cyan: { iconBg: 'bg-cyan-500/15', iconColor: 'text-cyan-400', solid: 'bg-cyan-500 text-white' },
  orange: { iconBg: 'bg-orange-500/15', iconColor: 'text-orange-400', solid: 'bg-orange-500 text-white' },
  rose: { iconBg: 'bg-rose-500/15', iconColor: 'text-rose-400', solid: 'bg-rose-600 text-white' },
  red: { iconBg: 'bg-red-500/15', iconColor: 'text-red-400', solid: 'bg-red-700 text-white' },
  slate: { iconBg: 'bg-slate-500/15', iconColor: 'text-slate-300', solid: 'bg-slate-600 text-white' },
} satisfies Record<string, Tone>

type ActionDisplay = { title: string; Icon: LucideIcon; module: ModuleName } & Tone

// Every action the backend writes, each with its own icon. Colour is semantic, never derived from the
// module badge: destructive rose, failures red, deactivate/cancel amber, completion emerald,
// view/export sky, everything else its module's tone.
const ACTION_DISPLAY: Record<string, ActionDisplay> = {
  // --- Reconciliation ---------------------------------------------------------
  'report.create': { title: 'Reconciliation Completed', Icon: FileCheck2, module: 'Reconciliation', ...TONE.indigo },
  'report.rename': { title: 'Reconciliation Renamed', Icon: PencilLine, module: 'Reconciliation', ...TONE.indigo },
  'report.tag.update': { title: 'Reconciliation Tag Changed', Icon: Tag, module: 'Reconciliation', ...TONE.indigo },
  'report.delete': { title: 'Reconciliation Deleted', Icon: Trash2, module: 'Reconciliation', ...TONE.rose },
  'report.bulk_delete': { title: 'Reconciliations Bulk Deleted', Icon: ListX, module: 'Reconciliation', ...TONE.rose },
  'report.rerun': { title: 'Reconciliation Rerun Started', Icon: RotateCcw, module: 'Reconciliation', ...TONE.indigo },
  // Logged when the upload URL is issued; the browser's direct PUT to R2 is never confirmed server-side.
  'file.upload_initiated': { title: 'File Upload Started', Icon: Upload, module: 'Reconciliation', ...TONE.indigo },

  // --- Mapping ------------------------------------------------------------------
  'report.column_mapping.updated': { title: 'Column Mapping Updated', Icon: Columns3, module: 'Mapping', ...TONE.sky },
  'report.matching_rules.updated': { title: 'Matching Rules Updated', Icon: SlidersHorizontal, module: 'Mapping', ...TONE.sky },

  // --- Processing ---------------------------------------------------------------
  'report.run.started': { title: 'Reconciliation Run Started', Icon: PlayCircle, module: 'Processing', ...TONE.amber },
  'report.run.completed': { title: 'Reconciliation Run Completed', Icon: CircleCheckBig, module: 'Processing', ...TONE.emerald },
  'report.run.failed': { title: 'Reconciliation Run Failed', Icon: CircleX, module: 'Processing', ...TONE.red },

  // --- Results ------------------------------------------------------------------
  'report.results.viewed': { title: 'Viewed Reconciliation Results', Icon: Eye, module: 'Results', ...TONE.sky },
  'report.row.review': { title: 'Transaction Marked Reviewed', Icon: ClipboardCheck, module: 'Results', ...TONE.emerald },
  // Every resolve entry carries its kind, so it shows as one of the two variants below; this is the fallback.
  'report.row.resolve': { title: 'Transaction Resolved', Icon: BadgeCheck, module: 'Results', ...TONE.emerald },
  'report.row.unresolve': { title: 'Resolution Undone', Icon: Undo2, module: 'Results', ...TONE.amber },

  // --- Reports ------------------------------------------------------------------
  'report.export': { title: 'Report Exported', Icon: FileDown, module: 'Reports', ...TONE.sky },
  'report.bulk_export': { title: 'Reports Bulk Exported', Icon: FolderDown, module: 'Reports', ...TONE.sky },
  'report.comparison_export': { title: 'Combined Report Exported', Icon: GitCompareArrows, module: 'Reports', ...TONE.sky },
  'report.export.delete': { title: 'Export Deleted', Icon: FileMinus, module: 'Reports', ...TONE.rose },
  'report.email': { title: 'Report Emailed', Icon: Mail, module: 'Reports', ...TONE.violet },
  'report.comparison_email': { title: 'Combined Report Emailed', Icon: MailPlus, module: 'Reports', ...TONE.violet },

  // --- Templates ----------------------------------------------------------------
  'matchRuleTemplate.create': { title: 'Match Rule Template Created', Icon: ListPlus, module: 'Templates', ...TONE.lime },
  'matchRuleTemplate.delete': { title: 'Match Rule Template Deleted', Icon: ListMinus, module: 'Templates', ...TONE.rose },
  'reportTemplate.create': { title: 'Report Template Created', Icon: LayoutTemplate, module: 'Templates', ...TONE.lime },
  'reportTemplate.delete': { title: 'Report Template Deleted', Icon: BookX, module: 'Templates', ...TONE.rose },

  // --- Authentication -----------------------------------------------------------
  'auth.login': { title: 'Signed In', Icon: LogIn, module: 'Authentication', ...TONE.pink },
  'auth.login_failed': { title: 'Sign-in Failed', Icon: ShieldAlert, module: 'Authentication', ...TONE.red },
  // Every permission gate logs `<resource>.<action>.denied`; the list endpoint matches `*` keys by suffix.
  '*.denied': { title: 'Access Denied', Icon: ShieldBan, module: 'Authentication', ...TONE.red },

  // --- Team ---------------------------------------------------------------------
  'organization.member.invite': { title: 'Team Member Invited', Icon: UserPlus, module: 'Team', ...TONE.cyan },
  'organization.invitation.accept': { title: 'Invitation Accepted', Icon: UserCheck, module: 'Team', ...TONE.emerald },
  'organization.invitation.cancel': { title: 'Invitation Canceled', Icon: MailX, module: 'Team', ...TONE.amber },
  'organization.member.role_update': { title: 'Member Role Changed', Icon: ShieldCheck, module: 'Team', ...TONE.cyan },
  'organization.member.remove': { title: 'Team Member Removed', Icon: UserMinus, module: 'Team', ...TONE.rose },
  'member.update': { title: 'Team Member Updated', Icon: UserCog, module: 'Team', ...TONE.cyan },
  'team.department.create': { title: 'Department Created', Icon: Building2, module: 'Team', ...TONE.cyan },

  // --- Settings -----------------------------------------------------------------
  'organization.update': { title: 'Organization Profile Updated', Icon: Settings2, module: 'Settings', ...TONE.orange },
  'organization.delete': { title: 'Organization Deleted', Icon: OctagonX, module: 'Settings', ...TONE.rose },
  'settings.organization_info.update': { title: 'Organization Details Updated', Icon: Earth, module: 'Settings', ...TONE.orange },
  'settings.reconciliation_defaults.update': { title: 'Reconciliation Defaults Updated', Icon: SlidersVertical, module: 'Settings', ...TONE.orange },
  'settings.notifications.update': { title: 'Notification Preferences Updated', Icon: BellRing, module: 'Settings', ...TONE.orange },
  'settings.organization_logo.presign_requested': { title: 'Logo Upload Started', Icon: ImageUp, module: 'Settings', ...TONE.orange },
  'settings.avatar.presign_requested': { title: 'Avatar Upload Started', Icon: CircleUserRound, module: 'Settings', ...TONE.orange },
}

// One action string that covers distinct events, told apart by its metadata or status (see variantOf).
const VARIANT_DISPLAY: Record<string, Pick<ActionDisplay, 'title' | 'Icon' | keyof Tone>> = {
  'report.delete|draft': { title: 'Draft Deleted', Icon: FileX2, ...TONE.rose },
  'report.row.review|cleared': { title: 'Transaction Review Cleared', Icon: ClipboardX, ...TONE.amber },
  'report.row.resolve|matched': { title: 'Transactions Matched Manually', Icon: Link2, ...TONE.emerald },
  'report.row.resolve|explained': { title: 'Break Explained', Icon: MessageSquareText, ...TONE.sky },
  'report.comparison_export|failed': { title: 'Combined Report Export Failed', Icon: FileWarning, ...TONE.red },
  'member.update|deactivated': { title: 'Team Member Deactivated', Icon: UserX, ...TONE.amber },
  'member.update|reactivated': { title: 'Team Member Reactivated', Icon: UserRoundCheck, ...TONE.emerald },
  'member.update|department': { title: 'Member Department Changed', Icon: Network, ...TONE.cyan },
  'organization.update|logo': { title: 'Organization Logo Changed', Icon: ImagePlus, ...TONE.orange },
  'organization.update|name': { title: 'Organization Renamed', Icon: TextCursorInput, ...TONE.orange },
}

type Metadata = Record<string, unknown>

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

/** The `to` side of a `{ changes: { field: { from, to } } }` diff, if that field changed. */
function changedTo(metadata: Metadata, field: string): unknown {
  const changes = metadata.changes as Record<string, { to?: unknown }> | undefined
  return changes?.[field]?.to
}

function variantOf(log: Pick<AuditLog, 'action' | 'metadata'> & { status?: AuditLog['status'] }): string | undefined {
  const metadata = log.metadata ?? {}
  switch (log.action) {
    case 'report.delete':
      return metadata.wasDraft === true ? 'draft' : undefined
    case 'report.row.review':
      return metadata.reviewed === false ? 'cleared' : undefined
    case 'report.row.resolve': {
      const kind = str(metadata.kind)
      return kind === 'matched' || kind === 'explained' ? kind : undefined
    }
    case 'report.comparison_export':
      return log.status === 'failed' ? 'failed' : undefined
    case 'member.update': {
      // Entries written before diffs existed carry `status`/`department` at the top level.
      const status = changedTo(metadata, 'status') ?? metadata.status
      if (status === 'inactive') return 'deactivated'
      if (status === 'active') return 'reactivated'
      return changedTo(metadata, 'department') !== undefined ? 'department' : undefined
    }
    case 'organization.update':
      if ('logo' in metadata) return 'logo'
      return 'name' in metadata ? 'name' : undefined
    default:
      return undefined
  }
}

/** The ACTION_DISPLAY / ACTION_DETAIL key for an action: itself, or its `*` pattern for dynamic actions. */
function displayKey(action: string) {
  return action.endsWith('.denied') ? '*.denied' : action
}

function humanizeAction(action: string) {
  return action.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function actionDisplay(log: Pick<AuditLog, 'action' | 'metadata'> & { status?: AuditLog['status'] }): ActionDisplay {
  const base = ACTION_DISPLAY[displayKey(log.action)] ?? {
    title: humanizeAction(log.action),
    Icon: CircleHelp,
    module: 'Settings',
    ...TONE.slate,
  }
  const variant = variantOf(log)
  const override = variant ? VARIANT_DISPLAY[`${log.action}|${variant}`] : undefined
  return override ? { ...base, ...override } : base
}

function humanizeKey(key: string) {
  return key.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, (c) => c.toUpperCase())
}

function humanizeEnumValue(value: string) {
  return value
    .split(/[_-]+/)
    .map((word) => (word.length <= 2 ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1).toLowerCase()))
    .join(' ')
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/
const ENUM_RE = /^([A-Z][A-Z0-9]*(_[A-Z0-9]+)*|[a-z][a-z0-9]*([_-][a-z0-9]+)+)$/

/** Raw ids never mean anything to a reader: Better Auth ids aren't UUIDs, so `*Id` keys are dropped too. */
function isOpaque(key: string, value: unknown) {
  return /Ids?$/.test(key) || (typeof value === 'string' && UUID_RE.test(value))
}

function formatMetaValue(value: unknown): string {
  if (value == null) return 'None'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return formatNumber(value)
  if (typeof value === 'string') {
    if (ISO_DATE_RE.test(value)) {
      const date = new Date(value)
      if (!Number.isNaN(date.getTime())) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    return ENUM_RE.test(value) ? humanizeEnumValue(value) : value
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return 'None'
    const isShortList = value.length <= 3 && value.every((item) => typeof item === 'string')
    return isShortList ? value.join(', ') : `${value.length} items`
  }
  return 'Multiple fields'
}

const FIELD_LABELS: Record<string, string> = {
  orgType: 'Organization Type',
  dateFormat: 'Date Format',
  defaultAmountTolerance: 'Default Amount Tolerance',
  defaultDateToleranceDays: 'Default Date Tolerance',
  amountTolerance: 'Amount Tolerance',
  dateToleranceDays: 'Date Tolerance',
  sameCurrencyOnly: 'Same Currency Only',
  ignoreNonNumericPrefix: 'Ignore Non-numeric Prefix',
  emailNotificationsEnabled: 'Email Notifications',
  weeklyDigestEnabled: 'Weekly Digest',
}

// Column-mapping diffs are keyed fileA<Field> / fileB<Field> (reportService.js's diffColumnMapping).
function fieldLabel(key: string) {
  const mapping = /^file([AB])([A-Z]\w*)$/.exec(key)
  if (mapping) return `${mapping[1] === 'A' ? 'Internal' : 'Counterparty'} ${humanizeKey(mapping[2])} Column`
  return FIELD_LABELS[key] ?? humanizeKey(key)
}

function formatFieldValue(key: string, value: unknown): string {
  if (value == null) return 'None'
  if (typeof value === 'boolean') return value ? 'On' : 'Off'
  if (/AmountTolerance$|^amountTolerance$/.test(key)) return `${value}%`
  if (/DateToleranceDays$|^dateToleranceDays$/.test(key)) return `${value} day${value === 1 ? '' : 's'}`
  if (key === 'role' && typeof value === 'string') return roleLabel(value)
  if (key === 'status' && typeof value === 'string') return humanizeEnumValue(value)
  return formatMetaValue(value)
}

function roleLabel(role: unknown) {
  return ROLE_LABELS[role as MemberRole] ?? formatMetaValue(role)
}

/** A create logs `from: null` and a removal `to: null`; an arrow only appears when both sides are real. */
function formatChange(key: string, from: unknown, to: unknown): string | null {
  if (from == null && to == null) return null
  if (from == null) return `${fieldLabel(key)}: ${formatFieldValue(key, to)}`
  if (to == null) return `${fieldLabel(key)}: ${formatFieldValue(key, from)} removed`
  return `${fieldLabel(key)}: ${formatFieldValue(key, from)} → ${formatFieldValue(key, to)}`
}

function formatSubjectLine(subject: unknown): string | undefined {
  if (!subject || typeof subject !== 'object') return undefined
  const { name, code } = subject as Metadata
  const n = str(name)
  const c = str(code)
  if (n && c) return `${n} (${c})`
  return n ?? c
}

function plural(count: unknown, noun: string) {
  const n = typeof count === 'number' ? count : Array.isArray(count) ? count.length : 0
  return `${formatNumber(n)} ${noun}${n === 1 ? '' : 's'}`
}

const LOGIN_METHOD_LABEL: Record<string, string> = { email: 'email & password', google: 'Google', apple: 'Apple' }

function recipientLines(metadata: Metadata): string[] {
  const to = Array.isArray(metadata.to) ? (metadata.to as string[]) : []
  const lines = [`Sent to ${to.length <= 2 ? to.join(', ') : plural(to, 'recipient')}`]
  const delivered = metadata.delivered
  if (typeof delivered === 'number' && delivered < to.length) lines.push(`${plural(to.length - delivered, 'recipient')} opted out`)
  return lines
}

// Long enough to read the gist of a note in the details column; the full note is on the transaction itself.
const RESOLUTION_NOTE_PREVIEW_LENGTH = 80

// Shared by resolve and undo: which transactions, and why.
function resolutionLine(metadata: Metadata) {
  const refs = formatMetaValue(metadata.transactionRefs)
  const note = str(metadata.note)
  if (!note) return refs
  const preview = note.length > RESOLUTION_NOTE_PREVIEW_LENGTH ? `${note.slice(0, RESOLUTION_NOTE_PREVIEW_LENGTH)}…` : note
  return `${refs} · ${preview}`
}

function exportLine(metadata: Metadata) {
  const format = str(metadata.format)?.toUpperCase() ?? 'File'
  const template = str(metadata.template)
  return template ? `${format} · ${template} template` : format
}

// Sentences for actions whose metadata reads poorly as `Key: value` pairs. Actions not listed here
// (diffs, settings) go through the generic flattener in detailsForLog.
const ACTION_DETAIL: Record<string, (metadata: Metadata, action: string) => string[]> = {
  'report.create': (m) => [str(m.filePair) ?? '', str(m.matchRate) ? `Match rate ${m.matchRate}` : ''],
  'report.delete': (m) => [str(m.filePair) ?? ''],
  'report.bulk_delete': (m) => [`${plural(m.count, 'reconciliation')} deleted`, formatMetaValue(m.references)],
  'report.run.started': (m) => [str(m.filePair) ?? ''],
  'report.rerun': (m) => [str(m.filePair) ?? ''],
  'report.row.resolve': (m) => [resolutionLine(m)],
  'report.row.unresolve': (m) => [resolutionLine(m)],
  'report.run.completed': (m) => [
    str(m.matchRate) ? `Match rate ${m.matchRate}` : '',
    typeof m.totalBreakValue === 'number' ? `Break value ${formatNumber(m.totalBreakValue)}` : '',
  ],
  'report.run.failed': (m) => [str(m.reason) ?? 'No reason recorded'],
  'report.row.review': (m) => {
    // Older entries carry only `reportReference`.
    if (!str(m.transactionRef)) return [str(m.reportReference) ?? '']
    return [`Transaction ${m.transactionRef} (${formatMetaValue(m.rowStatus)})`]
  },
  'report.export': (m) => [exportLine(m)],
  'report.bulk_export': (m) => [`${plural(m.references, 'report')} · ${exportLine(m)}`, formatMetaValue(m.references)],
  'report.comparison_export': (m) => [
    `${plural(m.references, 'reconciliation')} compared · ${exportLine(m)}`,
    str(m.reason) ?? formatMetaValue(m.references),
  ],
  'report.export.delete': (m) => [`${exportLine(m)} export from ${formatMetaValue(m.exportedAt)}`],
  'report.email': recipientLines,
  'report.comparison_email': (m) => [...recipientLines(m), `${plural(m.references, 'reconciliation')} compared`],
  'file.upload_initiated': (m) => [
    [str(m.filename), typeof m.sizeBytes === 'number' ? formatFileSize(m.sizeBytes) : undefined].filter(Boolean).join(' · '),
  ],
  'settings.organization_logo.presign_requested': (m) => [str(m.filename) ?? ''],
  'settings.avatar.presign_requested': (m) => [str(m.filename) ?? ''],
  'matchRuleTemplate.create': (m) => [str(m.description) ?? ''],
  'matchRuleTemplate.delete': (m) => [typeof m.timesUsed === 'number' ? `Used ${plural(m.timesUsed, 'time')}` : ''],
  'reportTemplate.create': (m) => [`Sections: ${(Array.isArray(m.sections) ? (m.sections as string[]) : []).map(humanizeKey).join(', ') || 'None'}`],
  'auth.login': (m) => [`Signed in with ${LOGIN_METHOD_LABEL[str(m.method) ?? ''] ?? formatMetaValue(m.method)}`],
  'auth.login_failed': () => ['Wrong password for email sign-in'],
  '*.denied': (m, action) => {
    const [resource, operation] = action.split('.')
    const reason = m.reason === 'inactive' ? 'Account is deactivated' : `${roleLabel(m.role)} role lacks this permission`
    return [`Tried to ${operation} ${humanizeKey(resource).toLowerCase()}`, reason]
  },
  'organization.member.invite': (m) => [`Invited as ${roleLabel(m.role)}`, str(m.email) ?? ''],
  'organization.member.remove': (m) => [str(m.role) ? `Was ${roleLabel(m.role)}` : ''],
  // Entries written before the previous role was captured carry only the new `role`.
  'organization.member.role_update': (m) => (m.changes ? genericLines(m) : [`Role set to ${roleLabel(m.role)}`]),
  'organization.invitation.accept': (m) => [str(m.role) ? `Joined as ${roleLabel(m.role)}` : 'Joined the organization'],
  'organization.invitation.cancel': (m) => [str(m.role) ? `Invitation as ${roleLabel(m.role)} withdrawn` : ''],
  'organization.update': (m) => {
    const lines = [str(m.name) ? `Name: ${m.name}` : '']
    if ('logo' in m) lines.push(m.logo ? 'New logo uploaded' : 'Logo removed')
    return lines
  },
  'team.department.create': (m) => [str(m.department) ?? ''],
}

/** `Key: value` lines for any metadata shape, pairing `{ changes: { field: { from, to } } }` diffs. */
function genericLines(metadata: Metadata): string[] {
  const lines: string[] = []
  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined || key === 'subject' || isOpaque(key, value)) continue
    if (key === 'changes' && value && typeof value === 'object') {
      for (const [field, change] of Object.entries(value as Record<string, { from: unknown; to: unknown }>)) {
        const line = formatChange(field, change?.from, change?.to)
        if (line) lines.push(line)
      }
      continue
    }
    lines.push(`${fieldLabel(key)}: ${formatFieldValue(key, value)}`)
  }
  return lines
}

// Details column and sidebar: the `subject` (who/what the entry is about) is always line one, then at
// most one more line; without a subject, two. Never empty while the entry has an entity type.
export function detailsForLog(log: Pick<AuditLog, 'action' | 'metadata' | 'entityType'>): string[] {
  const metadata = log.metadata ?? {}
  // Entries written before `subject` existed name their report as `reportName`.
  const subjectLine = formatSubjectLine(metadata.subject) ?? str(metadata.reportName)
  const describe = ACTION_DETAIL[displayKey(log.action)]
  const lines = (describe ? describe(metadata, log.action) : genericLines(metadata)).filter((line) => line && line !== 'None')

  if (lines.length === 0 && !subjectLine && log.entityType) lines.push(humanizeKey(log.entityType))

  const rest = lines.slice(0, subjectLine ? 1 : 2)
  return subjectLine ? [subjectLine, ...rest] : rest
}

// Order matters: Edge and Opera user agents also contain "Chrome/", and Chrome's contains "Safari/".
const BROWSERS: [RegExp, string][] = [
  [/Edg\//, 'Edge'],
  [/OPR\//, 'Opera'],
  [/Firefox\//, 'Firefox'],
  [/Chrome\//, 'Chrome'],
  [/Safari\//, 'Safari'],
]
const OPERATING_SYSTEMS: [RegExp, string][] = [
  [/iPhone|iPad/, 'iOS'],
  [/Android/, 'Android'],
  [/Windows/, 'Windows'],
  [/Mac OS X/, 'macOS'],
  [/Linux/, 'Linux'],
]

/** "Chrome on macOS" from a raw user-agent string; the full string stays available as a tooltip. */
export function describeUserAgent(userAgent: string | null): string | null {
  if (!userAgent) return null
  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1]
  const os = OPERATING_SYSTEMS.find(([pattern]) => pattern.test(userAgent))?.[1]
  if (browser && os) return `${browser} on ${os}`
  if (browser) return browser
  return os ?? userAgent
}

// Picking a module in the filter sends every action string that belongs to it.
export const MODULE_ACTIONS = Object.fromEntries(
  MODULES.map((module) => [
    module,
    Object.entries(ACTION_DISPLAY)
      .filter(([, display]) => display.module === module)
      .map(([action]) => action),
  ]),
) as Record<ModuleName, string[]>
