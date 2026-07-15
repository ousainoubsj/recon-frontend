import Image from 'next/image'
import { ChevronDown, Download, FileSpreadsheet, Table2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

const categoryBreakdown = [
  { label: 'Amount Mismatch', amount: '$182,450.25', percent: '58.41%', width: 100, icon: '/icons/break-value.png', color: '#f87171' },
  { label: 'Missing in Counterparty File', amount: '$78,520.10', percent: '25.15%', width: 62, icon: '/icons/unmatched.png', color: '#fb923c' },
  { label: 'Missing in Internal Ledger', amount: '$31,245.60', percent: '10.00%', width: 40, icon: '/icons/match-rate.png', color: '#60a5fa' },
  { label: 'Date Mismatch', amount: '$12,120.30', percent: '3.88%', width: 22, icon: '/icons/date-mismatch.png', color: '#a78bfa' },
  { label: 'Others', amount: '$8,114.50', percent: '2.56%', width: 16, icon: '/icons/others.png', color: '#34d399' },
]

const fileSummary = [
  {
    title: 'Internal Ledger',
    filename: 'Internal_Ledger_June.csv',
    accent: '#04E2B8',
    rows: '125,430',
    columns: '18',
    fileSize: '24.7 MB',
    imported: 'Jun 30, 2026 10:15 AM',
  },
  {
    title: 'Counterparty File',
    filename: 'Bank_Statement_June.csv',
    accent: '#9366DE',
    rows: '124,980',
    columns: '16',
    fileSize: '23.1 MB',
    imported: 'Jun 30, 2026 10:15 AM',
  },
]

export default function ResultsSidePanel() {
  return (
    <ScrollArea className="h-191 w-full min-w-0 pr-3">
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-[#232D47] bg-[#0E182D]/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <TruncateTooltip as="h3" className="truncate text-lg font-semibold text-white" tooltip="Breakdown by Category (Top 5)">
            Breakdown by Category <span className="text-sm font-normal text-slate-400">(Top 5)</span>
          </TruncateTooltip>
          <TruncateTooltip
            as="button"
            type="button"
            className="flex truncate cursor-pointer items-center gap-1 rounded-lg border border-[#232D47] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5"
            tooltip="View All"
          >
            View All
            <ChevronDown className="h-3.5 w-3.5" />
          </TruncateTooltip>
        </div>

        <ul className="mt-4 space-y-4">
          {categoryBreakdown.map((item) => (
            <li key={item.label} className="flex items-center gap-3">
              <Image src={item.icon} alt="" width={36} height={36} className="h-9 w-9 shrink-0" />

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <TruncateTooltip as="p" className="truncate text-sm text-slate-200" tooltip={item.label}>
                    {item.label}
                  </TruncateTooltip>
                  <p className="shrink-0 text-sm font-medium text-white">{item.amount}</p>
                </div>
                <div className="mt-2 h-1 w-full rounded-full bg-[#1B2540]">
                  <div className="h-1 rounded-full" style={{ width: `${item.width}%`, backgroundColor: item.color }} />
                </div>
              </div>

              <p className="w-14 shrink-0 text-right text-sm text-slate-400">{item.percent}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0E182D]/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">File Summary</h3>
        </div>

        <div className="mt-4 grid grid-cols-1 divide-y divide-[#232D47] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {fileSummary.map((file) => (
            <div key={file.title} className="pt-4 first:pt-0 sm:pt-0 sm:pr-4 sm:last:pr-0 sm:last:pl-4">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${file.accent}26`, color: file.accent }}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <TruncateTooltip as="p" className="truncate text-sm font-semibold text-white" tooltip={file.title}>
                    {file.title}
                  </TruncateTooltip>
                  <TruncateTooltip as="p" className="truncate text-xs text-slate-400" tooltip={file.filename}>
                    {file.filename}
                  </TruncateTooltip>
                </div>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Rows</span>
                  <span className="font-medium text-slate-200">{file.rows}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Columns</span>
                  <span className="font-medium text-slate-200">{file.columns}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">File Size</span>
                  <span className="font-medium text-slate-200">{file.fileSize}</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-slate-400">Imported</span>
                  <TruncateTooltip as="span" className="truncate font-medium text-slate-200" tooltip={file.imported}>
                    {file.imported}
                  </TruncateTooltip>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Processed
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

            <div className="rounded-2xl border border-[#232D47] bg-[#0E182D] p-4">
        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#232D47] p-4 text-left hover:bg-white/5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-amber-500/15">
              <Image src="/icons/unmatched.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
            </span>
            <div className="min-w-0">
              <TruncateTooltip as="p" className="truncate text-sm font-semibold text-white" tooltip="View Unmatched">
                View Unmatched
              </TruncateTooltip>
              <TruncateTooltip as="p" className="mt-0.5 truncate text-xs text-slate-400" tooltip="Review all unmatched items">
                Review all unmatched items
              </TruncateTooltip>
            </div>
          </button>

          <button
            type="button"
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#232D47] p-4 text-left hover:bg-white/5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-violet-500/15">
              <Image src="/icons/duplicates.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
            </span>
            <div className="min-w-0">
              <TruncateTooltip as="p" className="truncate text-sm font-semibold text-white" tooltip="View Duplicates">
                View Duplicates
              </TruncateTooltip>
              <TruncateTooltip as="p" className="mt-0.5 truncate text-xs text-slate-400" tooltip="Review duplicate records">
                Review duplicate records
              </TruncateTooltip>
            </div>
          </button>

          <button
            type="button"
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#232D47] p-4 text-left hover:bg-white/5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Table2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <TruncateTooltip as="p" className="truncate text-sm font-semibold text-white" tooltip="Transaction Explorer">
                Transaction Explorer
              </TruncateTooltip>
              <TruncateTooltip as="p" className="mt-0.5 truncate text-xs text-slate-400" tooltip="Drill down to transaction level">
                Drill down to transaction level
              </TruncateTooltip>
            </div>
          </button>

          <button
            type="button"
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#232D47] p-4 text-left hover:bg-white/5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
              <Download className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <TruncateTooltip as="p" className="truncate text-sm font-semibold text-white" tooltip="Export Results">
                Export Results
              </TruncateTooltip>
              <TruncateTooltip as="p" className="mt-0.5 truncate text-xs text-slate-400" tooltip="Download in multiple formats">
                Download in multiple formats
              </TruncateTooltip>
            </div>
          </button>
        </div>
      </div>

    </div>
    </ScrollArea>
  )
}
