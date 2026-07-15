import Image from 'next/image'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import {
  ArrowUpRight,
  Activity,
  Clock,
  Cloud,
  Database,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Mail,
  Shield,
  Upload,
  User,
  Users,
} from 'lucide-react'

const reconciliations = [
  {
    date: 'Jun 30, 2026',
    time: '10:24 AM',
    fileA: 'Internal_Jun.csv',
    fileB: 'Bank_Jun.csv',
    iconSrc: '/icons/csv.png',
    matchRate: '98.64%',
    breakValue: '$12,450.75',
  },
  {
    date: 'Jun 29, 2026',
    time: '04:15 PM',
    fileA: 'Ledger_May.xlsx',
    fileB: 'Statement_May.xlsx',
    iconSrc: '/icons/xls.png',
    matchRate: '97.21%',
    breakValue: '$18,932.40',
  },
  {
    date: 'Jun 28, 2026',
    time: '11:02 AM',
    fileA: 'Internal_May.csv',
    fileB: 'Bank_May.csv',
    iconSrc: '/icons/csv.png',
    matchRate: '99.02%',
    breakValue: '$7,218.90',
  },
  {
    date: 'Jun 27, 2026',
    time: '03:48 PM',
    fileA: 'Ledger_Apr.xlsx',
    fileB: 'Statement_Apr.xlsx',
    iconSrc: '/icons/xls.png',
    matchRate: '96.45%',
    breakValue: '$22,830.15',
  },
  {
    date: 'Jun 26, 2026',
    time: '09:31 AM',
    fileA: 'Internal_Apr.csv',
    fileB: 'Bank_Apr.csv',
    iconSrc: '/icons/csv.png',
    matchRate: '98.91%',
    breakValue: '$11,998.40',
  },
  {
    date: 'Jun 25, 2026',
    time: '02:10 PM',
    fileA: 'Ledger_Mar.xlsx',
    fileB: 'Statement_Mar.xlsx',
    iconSrc: '/icons/xls.png',
    matchRate: '97.85%',
    breakValue: '$15,340.20',
  },
]

const activity = [
  {
    title: 'Reconciliation completed',
    subtitle: 'Internal_Jun.csv ↔ Bank_Jun.csv',
    time: '10:24 AM',
    Icon: FileText,
    tint: 'bg-blue-500 text-white',
  },
  {
    title: 'Report exported to Excel',
    subtitle: 'Internal_May.csv_Reconciliation.xlsx',
    time: 'Yesterday',
    Icon: FileSpreadsheet,
    tint: 'bg-emerald-500 text-white',
  },
  {
    title: 'Report emailed to 3 recipients',
    subtitle: 'Monthly Reconciliation Report',
    time: 'Yesterday',
    Icon: Mail,
    tint: 'bg-indigo-500 text-white',
  },
  {
    title: 'File uploaded',
    subtitle: 'Bank_Jun.csv',
    time: 'Yesterday',
    Icon: Upload,
    tint: 'bg-blue-500 text-white',
  },
  {
    title: 'User login',
    subtitle: 'Ousainou BS Jammeh',
    time: '2 days ago',
    Icon: User,
    tint: 'bg-slate-500 text-white',
  },
  {
    title: 'Report downloaded',
    subtitle: 'Internal_Apr.csv_Reconciliation.pdf',
    time: '3 days ago',
    Icon: Download,
    tint: 'bg-emerald-500 text-white',
  },
]

const systemHealth = [
  { label: 'Browser Processing', value: 'Active', Icon: Shield, valueColor: 'text-emerald-400', tint: 'bg-emerald-500/15 text-emerald-400' },
  { label: 'Storage (R2)', value: 'Healthy', Icon: Cloud, valueColor: 'text-emerald-400', tint: 'bg-sky-500/15 text-sky-400' },
  { label: 'Database', value: 'Healthy', Icon: Database, valueColor: 'text-emerald-400', tint: 'bg-indigo-500/15 text-indigo-400' },
  { label: 'Last Backup', value: 'Jun 30, 2026 02:15 AM', Icon: Clock, valueColor: 'text-slate-300', tint: 'bg-slate-500/15 text-slate-400' },
  { label: 'Active Users', value: '12', Icon: Users, valueColor: 'text-white', tint: 'bg-slate-500/15 text-slate-400' },
  { label: 'Processing Engine', value: 'Operational', Icon: Activity, valueColor: 'text-emerald-400', tint: 'bg-emerald-500/15 text-emerald-400' },
]

function PanelHeader({ title, showViewAll }: { title: string; showViewAll?: boolean }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {showViewAll && (
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1 rounded-lg border border-[#232D47] bg-[#0D152A] px-3 py-1.5 text-xs font-medium text-slate-300"
        >
          View All
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export default function ActivityOverview() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <div className="rounded-2xl border border-[#232D47] bg-[#0E182D] p-4 lg:col-span-2">
        <PanelHeader title="Recent Reconciliations" showViewAll />

        <ScrollArea className="h-82 w-full">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[#9EA7C1]">
                <th className="pb-3 pr-3 text-nowrap font-semibold">Date</th>
                <th className="pb-3 pr-3 text-nowrap font-semibold">File Pair</th>
                <th className="pb-3 pr-3 text-nowrap font-semibold">Match Rate</th>
                <th className="pb-3 pr-3 text-nowrap font-semibold">Break Value</th>
                <th className="pb-3 pr-3 text-nowrap font-semibold">Status</th>
                <th className="pb-3 text-nowrap font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reconciliations.map((row) => (
                <tr key={row.date} className="border-t border-[#1B2540]">
                  <td className="py-2 pr-3 align-top">
                    <TruncateTooltip as="p" className="truncate text-slate-200" tooltip={row.date}>
                      {row.date}
                    </TruncateTooltip>
                    <p className="text-xs text-slate-400">{row.time}</p>
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <TruncateTooltip
                      as="span"
                      className="flex items-center gap-2 text-slate-200 truncate line-clamp-1"
                      tooltip={`${row.fileA} ↔ ${row.fileB}`}
                    >
                      <Image src={row.iconSrc} alt="" width={20} height={20} className="h-4 w-4 shrink-0" />
                      {row.fileA} ↔ {row.fileB}
                    </TruncateTooltip>
                  </td>
                  <td className="py-2 pr-3 align-top text-slate-200">{row.matchRate}</td>
                  <td className="py-2 pr-3 align-top text-slate-200">{row.breakValue}</td>
                  <td className="py-2 pr-3 align-top">
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
                      Completed
                    </span>
                  </td>
                  <td className="py-2 align-top">
                    <div className="flex items-center gap-3 text-slate-400">
                      <button type="button" aria-label="View" className="cursor-pointer hover:text-white">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label="Download" className="cursor-pointer hover:text-white">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0E182D] p-4">
        <PanelHeader title="Recent Activity" showViewAll />

        <ScrollArea className="h-82 w-full">
          <ul className="divide-y divide-[#1B2540]">
            {activity.map(({ title, subtitle, time, Icon, tint }) => (
              <li key={title} className="flex items-start gap-3 py-3 first:pt-1">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tint}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <TruncateTooltip as="p" className="truncate text-sm text-slate-200" tooltip={title}>
                    {title}
                  </TruncateTooltip>
                  <TruncateTooltip as="p" className="truncate text-xs text-slate-400" tooltip={subtitle}>
                    {subtitle}
                  </TruncateTooltip>
                </div>
                <span className="shrink-0 whitespace-nowrap text-xs text-slate-400">{time}</span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>

      <div className="flex flex-col rounded-2xl border border-[#232D47] bg-[#0E182D] p-4">
        <PanelHeader title="System Health" />

        <ScrollArea className="h-82 w-full">
          <ul className="divide-y divide-[#1B2540]">
            {systemHealth.map(({ label, value, Icon, valueColor, tint }) => (
              <li key={label} className="flex items-center justify-between gap-2 py-3 first:pt-1">
                <span className="flex items-center gap-2.5 text-sm text-slate-300">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tint}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <TruncateTooltip as="p" className="truncate text-sm font-medium text-slate-300" tooltip={label}>
                    {label}
                  </TruncateTooltip>
                </span>
                <span className={`flex items-center gap-1.5 whitespace-nowrap text-sm font-medium ${valueColor}`}>
                  {value}
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                </span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
    </div>
  )
}
