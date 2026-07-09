import Image from 'next/image'
import { ArrowRight, ChevronRight, FileText, MoreVertical, ShoppingCart, Users } from 'lucide-react'
import { BuildingIcon } from '@/components/icons'

const templates = [
  {
    Icon: BuildingIcon,
    iconBg: 'bg-emerald-500/15 text-emerald-400',
    title: 'GTBank Monthly',
    metaLabel: 'Last used',
    metaValue: ' 2 days ago',
    runs: '24 successful runs',
  },
  {
    logo: 'VISA',
    iconBg: 'bg-indigo-500/20 text-white',
    title: 'VISA Settlement',
    badge: 'Default',
    metaValue: '5 days ago',
    runs: '18 successful runs',
  },
  {
    Icon: Users,
    iconBg: 'bg-orange-500/15 text-orange-400',
    title: 'Payroll vs Ledger',
    metaLabel: 'Last used:',
    metaValue: '1 week ago',
    runs: '32 successful runs',
  },
  {
    Icon: ShoppingCart,
    iconBg: 'bg-pink-500/15 text-pink-400',
    title: 'POS Settlement',
    metaLabel: 'Last used:',
    metaValue: '2 weeks ago',
    runs: '11 successful runs',
  },
]

const drafts = [
  {
    title: 'June Bank Reconciliation',
    files: [
      { icon: '/icons/csv.png', label: 'CSV' },
      { icon: '/icons/csv.png', label: 'CSV' },
    ],
    lastEdited: 'Last edited 15 mins ago',
    percent: 60,
  },
  {
    title: 'May Visa Settlement',
    files: [
      { icon: '/icons/xls.png', label: 'XLSX' },
      { icon: '/icons/csv.png', label: 'CSV' },
    ],
    lastEdited: 'Last edited 2 hours ago',
    percent: 30,
  },
]

function PanelHeader({ title, viewAllLabel }: { title: string; viewAllLabel: string }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <a href="#" className="flex items-center gap-1 text-sm font-medium text-sky-400 hover:underline">
        {viewAllLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}

export default function ReconciliationRecentActivity() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
      <div className="relative rounded-2xl border border-[#232D47] bg-[#0E182D] p-5">
        <PanelHeader title="Recent Templates" viewAllLabel="View all templates" />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {templates.map(({ Icon, logo, iconBg, title, badge, metaLabel, metaValue, runs }) => (
            <div
              key={title}
              className="rounded-xl shadow bg-[radial-gradient(100%_100%_at_0%_0%,rgba(255,255,255,0.45),rgba(255,255,255,0)_60%)] p-px"
            >
              <div className="h-full rounded-lg bg-[#111C3D]/90 px-4 py-5 space-y-1">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold italic ${iconBg}`}>
                  {Icon ? <Icon className="h-5 w-5" /> : logo}
                </span>
                <p className="mt-3 text-sm font-semibold text-white truncate">{title}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400 truncate">
                  {badge ? (
                    <span className="rounded-full bg-[#1B2540] px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                      {badge}
                    </span>
                  ) : (
                    metaLabel
                  )}
                  {metaValue}
                </p>
                <p className="mt-1.5 text-xs font-medium text-emerald-400">{runs}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Show more templates"
          className="absolute top-1/2 -right-4 hidden h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#232D47] bg-[#141B36] text-slate-300 shadow-md lg:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0E182D] p-5">
        <PanelHeader title="Recent Drafts" viewAllLabel="View all drafts" />

        <div className="divide-y divide-[#1B2540]">
          {drafts.map(({ title, files, lastEdited, percent }) => (
            <div key={title} className="flex items-center justify-between gap-4 py-2.5 first:pt-0.5 last:pb-0.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{title}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  {files.map(({ icon, label }, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs text-slate-400">
                      <Image src={icon} alt="" width={14} height={14} className="h-3.5 w-3.5" />
                      {label}
                    </span>
                  ))}
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                  <FileText className="h-3.5 w-3.5" />
                  {lastEdited}
                </p>
              </div>

              <div className="w-24 shrink-0">
                <p className="text-right text-sm font-semibold text-white">{percent}%</p>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#1B2540]">
                  <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${percent}%` }} />
                </div>
              </div>

              <button
                type="button"
                className="shrink-0 cursor-pointer rounded-lg border border-[#232D47] px-3 py-1.5 text-xs font-medium text-white hover:bg-white/5"
              >
                Continue
              </button>

              <button
                type="button"
                aria-label="More options"
                className="shrink-0 cursor-pointer text-slate-400 hover:text-white"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
