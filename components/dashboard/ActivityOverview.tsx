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
    Icon: FileText,
    iconColor: 'text-emerald-400',
    matchRate: '98.64%',
    breakValue: '$12,450.75',
  },
  {
    date: 'Jun 29, 2026',
    time: '04:15 PM',
    fileA: 'Ledger_May.xlsx',
    fileB: 'Statement_May.xlsx',
    Icon: FileSpreadsheet,
    iconColor: 'text-sky-400',
    matchRate: '97.21%',
    breakValue: '$18,932.40',
  },
  {
    date: 'Jun 28, 2026',
    time: '11:02 AM',
    fileA: 'Internal_May.csv',
    fileB: 'Bank_May.csv',
    Icon: FileText,
    iconColor: 'text-emerald-400',
    matchRate: '99.02%',
    breakValue: '$7,218.90',
  },
  {
    date: 'Jun 27, 2026',
    time: '03:48 PM',
    fileA: 'Ledger_Apr.xlsx',
    fileB: 'Statement_Apr.xlsx',
    Icon: FileSpreadsheet,
    iconColor: 'text-sky-400',
    matchRate: '96.45%',
    breakValue: '$22,830.15',
  },
  {
    date: 'Jun 26, 2026',
    time: '09:31 AM',
    fileA: 'Internal_Apr.csv',
    fileB: 'Bank_Apr.csv',
    Icon: FileText,
    iconColor: 'text-emerald-400',
    matchRate: '98.91%',
    breakValue: '$11,998.40',
  },
]

const activity = [
  {
    title: 'Reconciliation completed',
    subtitle: 'Internal_Jun.csv ↔ Bank_Jun.csv',
    time: '10:24 AM',
    Icon: FileText,
    tint: 'bg-blue-500/15 text-blue-400',
  },
  {
    title: 'Report exported to Excel',
    subtitle: 'Internal_May.csv_Reconciliation.xlsx',
    time: 'Yesterday',
    Icon: FileSpreadsheet,
    tint: 'bg-emerald-500/15 text-emerald-400',
  },
  {
    title: 'Report emailed to 3 recipients',
    subtitle: 'Monthly Reconciliation Report',
    time: 'Yesterday',
    Icon: Mail,
    tint: 'bg-indigo-500/15 text-indigo-400',
  },
  {
    title: 'File uploaded',
    subtitle: 'Bank_Jun.csv',
    time: 'Yesterday',
    Icon: Upload,
    tint: 'bg-blue-500/15 text-blue-400',
  },
  {
    title: 'User login',
    subtitle: 'Ousainou BS Jammeh',
    time: '2 days ago',
    Icon: User,
    tint: 'bg-slate-500/15 text-slate-400',
  },
]

const systemHealth = [
  { label: 'Browser Processing', value: 'Active', Icon: Shield, valueColor: 'text-emerald-400' },
  { label: 'Storage (R2)', value: 'Healthy', Icon: Cloud, valueColor: 'text-emerald-400' },
  { label: 'Database', value: 'Healthy', Icon: Database, valueColor: 'text-emerald-400' },
  { label: 'Last Backup', value: 'Jun 30, 2026 02:15 AM', Icon: Clock, valueColor: 'text-slate-300' },
  { label: 'Active Users', value: '12', Icon: Users, valueColor: 'text-white' },
  { label: 'Processing Engine', value: 'Operational', Icon: Activity, valueColor: 'text-emerald-400' },
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-medium uppercase tracking-wider text-slate-500">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">File Pair</th>
                <th className="pb-3 font-medium">Match Rate</th>
                <th className="pb-3 font-medium">Break Value</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reconciliations.map((row) => (
                <tr key={row.date} className="border-t border-[#1B2540]">
                  <td className="py-3 pr-3 align-top">
                    <p className="text-slate-200">{row.date}</p>
                    <p className="text-xs text-slate-500">{row.time}</p>
                  </td>
                  <td className="py-3 pr-3">
                    <span className="flex items-center gap-2 text-slate-200">
                      <row.Icon className={`h-4 w-4 shrink-0 ${row.iconColor}`} />
                      {row.fileA} ↔ {row.fileB}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-slate-200">{row.matchRate}</td>
                  <td className="py-3 pr-3 text-slate-200">{row.breakValue}</td>
                  <td className="py-3 pr-3">
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
                      Completed
                    </span>
                  </td>
                  <td className="py-3">
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
        </div>
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0E182D] p-4">
        <PanelHeader title="Recent Activity" showViewAll />

        <ul className="divide-y divide-[#1B2540]">
          {activity.map(({ title, subtitle, time, Icon, tint }) => (
            <li key={title} className="flex items-start gap-3 py-3 first:pt-1">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tint}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-200">{title}</p>
                <p className="truncate text-xs text-slate-500">{subtitle}</p>
              </div>
              <span className="shrink-0 whitespace-nowrap text-xs text-slate-500">{time}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col rounded-2xl border border-[#232D47] bg-[#0E182D] p-4">
        <PanelHeader title="System Health" />

        <ul className="divide-y divide-[#1B2540]">
          {systemHealth.map(({ label, value, Icon, valueColor }) => (
            <li key={label} className="flex items-center justify-between gap-2 py-3 first:pt-1">
              <span className="flex items-center gap-2.5 text-sm text-slate-300">
                <Icon className="h-4 w-4 text-slate-500" />
                {label}
              </span>
              <span className={`flex items-center gap-1.5 whitespace-nowrap text-sm font-medium ${valueColor}`}>
                {value}
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
              </span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="mt-3 cursor-pointer rounded-lg border border-[#232D47] py-2.5 text-sm font-medium text-slate-300 transition-colors duration-300 hover:bg-white/5"
        >
          View System Status
        </button>
      </div>
    </div>
  )
}
