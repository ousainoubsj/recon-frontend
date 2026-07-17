'use client'

import { useRef } from 'react'
import { ChevronRight, FileBarChart2, FileChartColumn, FilePlus2, FileWarning, Presentation } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

const templates = [
  {
    key: 'executive-summary',
    title: 'Executive Summary',
    description: 'High-level overview of reconciliation results',
    Icon: Presentation,
    iconClassName: 'bg-violet-500/15 text-violet-400',
    badge: 'POPULAR',
    badgeClassName: 'bg-violet-500/15 text-violet-300',
  },
  {
    key: 'reconciliation-summary',
    title: 'Reconciliation Summary',
    description: 'Detailed summary of matches, mismatches, etc',
    Icon: FileChartColumn,
    iconClassName: 'bg-sky-500/15 text-sky-400',
    badge: 'POPULAR',
    badgeClassName: 'bg-sky-500/15 text-sky-300',
    selected: true,
  },
  {
    key: 'unmatched-transactions',
    title: 'Unmatched Transactions',
    description: 'List of all unmatched items with details and reasons.',
    Icon: FileWarning,
    iconClassName: 'bg-amber-500/15 text-amber-400',
    badge: 'POPULAR',
    badgeClassName: 'bg-amber-500/15 text-amber-300',
  },
  {
    key: 'breakdown-analysis',
    title: 'Breakdown Analysis',
    description: 'In-depth analysis of break causes and categories.',
    Icon: FileBarChart2,
    iconClassName: 'bg-emerald-500/15 text-emerald-400',
    badge: 'POPULAR',
    badgeClassName: 'bg-emerald-500/15 text-emerald-300',
  },
  {
    key: 'custom-report',
    title: 'Custom Report',
    description: 'Build your own report with custom fields and filters.',
    Icon: FilePlus2,
    iconClassName: 'bg-slate-500/15 text-slate-300',
    badge: 'CUSTOM',
    badgeClassName: 'bg-slate-500/15 text-slate-300',
  },
]

export default function ReportTemplates() {
  const viewportRef = useRef<HTMLDivElement>(null)

  const scrollTemplates = () => {
    const viewport = viewportRef.current
    if (!viewport) return

    const atEnd = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 1
    viewport.scrollBy({ left: atEnd ? -viewport.clientWidth : viewport.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className="relative rounded-2xl border border-[#232D47] bg-[#0B122B]/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">Popular Report Templates</h3>
          <p className="mt-1 text-sm text-slate-400">Choose a template or start from scratch.</p>
        </div>
      </div>

      <ScrollArea className="mt-5 w-full min-w-0" viewportRef={viewportRef}>
        <div className="flex gap-4 pb-3">
          {templates.map(({ key, title, description, Icon, iconClassName, selected }) => (
            <button
              key={key}
              type="button"
              className={`w-48 shrink-0 cursor-pointer rounded-xl border p-3 text-left transition-all active:scale-95 ${
                selected ? 'border-sky-500/50 bg-sky-500/5' : 'border-[#232D47] bg-[#0E182D]/40 hover:bg-white/5'
              }`}
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
                <Icon className="h-5 w-5" />
              </span>
              <TruncateTooltip as="p" className="mt-2 w-full truncate font-semibold text-white" tooltip={title}>
                {title}
              </TruncateTooltip>
              <p className="mt-1 text-xs text-slate-400">{description}</p>
            </button>
          ))}
        </div>
      </ScrollArea>

      <button
        type="button"
        aria-label="Scroll templates"
        onClick={scrollTemplates}
        className="absolute top-1/2 -right-4 hidden h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#232D47] bg-[#141B36] text-slate-300 shadow-md lg:flex"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
