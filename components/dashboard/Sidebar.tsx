'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, BarChart3, CircleCheck, Clock, FileText, Settings, ShieldCheck, Users } from 'lucide-react'
import { DashboardIcon, PlusIcon } from '@/components/icons'
import AuditSecurityCard from '@/components/dashboard/AuditSecurityCard'
import SettingsCustomizeCard from '@/components/dashboard/SettingsCustomizeCard'
import TeamAccessCard from '@/components/dashboard/TeamAccessCard'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { useWizardStore } from '@/stores/wizard-store'
import { useReport } from '@/lib/hooks/useReports'
import { formatDateTime, formatDuration } from '@/lib/format'

const securityPoints = [
  'Encrypted in transit & at rest',
  'Org-scoped access only',
  'Full audit trail',
  'Your data stays yours',
]

const navItems = [
  { label: 'History', href: '/dashboard/history', Icon: Clock },
  { label: 'Reports', href: '/dashboard/reports', Icon: BarChart3 },
  { label: 'Audit Log', href: '/dashboard/audit-log', Icon: FileText },
  { label: 'Team', href: '/dashboard/team', Icon: Users },
  { label: 'Settings', href: '/dashboard/settings', Icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const isReconciliationProcess = pathname.startsWith('/dashboard/reconciliation-process')
  const isSettings = pathname === '/dashboard/settings'
  const isTeam = pathname === '/dashboard/team'
  const isAuditLog = pathname === '/dashboard/audit-log'

  const wizardReportId = useWizardStore((s) => s.reportId)
  const { data: wizardReport } = useReport(isReconciliationProcess ? wizardReportId : undefined)

  return (
    <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-[#232D47] bg-[#050F20] px-5 py-8 lg:flex">
      <Image src="/images/Reconcil-logo.png" alt="Reconcil" width={380} height={127} className="-ml-4 h-auto w-52" />

      <nav className="mt-8 space-y-1">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            pathname === '/dashboard' ? 'bg-white/5 text-[#1CEAEA]' : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <DashboardIcon className="h-5 w-5" />
          Dashboard
        </Link>
      </nav>

      <Link
        href="/dashboard/reconcile"
        className="mt-4 flex items-center justify-start gap-2 rounded-md bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 p-2.5 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-80 active:scale-95"
      >
        <PlusIcon className="h-4 w-4" />
        New Reconciliation
      </Link>

      <nav className="mt-6 space-y-1">
        {navItems.map(({ label, href, Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-white/5 text-[#1CEAEA]' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          )
        })}
      </nav>

      {isReconciliationProcess && (
        <div className="mt-6 rounded-xl border border-[#1E2A47] bg-[#0A1128] p-4">
          <h3 className="text-sm font-semibold text-white">Reconciliation Summary</h3>
          <p className="mt-3 text-xs text-slate-400">Completed in</p>
          {/* Derived from the report.run.started/report.run.completed
              audit-log pair (see getReport's runDurationMs) rather than a
              persisted duration column — falls back to "—" only if that
              pair is genuinely missing. */}
          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {wizardReport?.runDurationMs != null ? formatDuration(wizardReport.runDurationMs) : '—'}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {wizardReport?.status === 'completed' ? `at ${formatDateTime(wizardReport.runDate)}` : 'Not completed yet'}
          </p>
        </div>
      )}

      {isSettings && (
        <div className="mt-6">
          <SettingsCustomizeCard />
        </div>
      )}

      {isTeam && (
        <div className="mt-6">
          <TeamAccessCard />
        </div>
      )}

      {isAuditLog && (
        <div className="mt-6">
          <AuditSecurityCard />
        </div>
      )}

      <div className="mt-auto space-y-4">
        {!isSettings && !isTeam && !isReconciliationProcess && !isAuditLog && (
          <div className="rounded-xl border border-[#1E2A47] bg-[#0A1128] p-3">
            <div className="flex items-center gap-2 pb-2.5">
              <ShieldCheck className="h-4 w-4 text-[#1CEAEA]" />
              <p className="text-sm font-semibold text-white">Secure &amp; Private</p>
            </div>
            <ul className="mt-1 space-y-4">
              {securityPoints.map((point) => (
                <TruncateTooltip
                  key={point}
                  as="li"
                  className="flex items-center gap-2 text-xs text-slate-300 truncate"
                  tooltip={point}
                >
                  <CircleCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                {point}
                </TruncateTooltip>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-xl border border-[#1E2A47] bg-[#0A1128] p-4">
          <div className="flex items-start gap-3">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111C3D]">
              <Image src="/icons/headphones.png" alt="" width={20} height={20} className="h-5 w-5" />
              <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0A1128]" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Need support?</p>
              <p className="text-xs text-slate-400">We&apos;re here to help you.</p>
            </div>
          </div>
          <a
            href="mailto:support@reconcilepro.com"
            className="mt-3 block text-sm font-medium text-[#1CEAEA] hover:underline"
          >
            support@reconcilepro.com
          </a>
        </div>
      </div>
    </aside>
  )
}
