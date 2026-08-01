'use client'

import { useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { useReportTemplates } from '@/lib/hooks/useReportTemplates'
import { decorateTemplates } from '@/lib/reportTemplateDecorations'

type ReportTemplatesProps = {
  selectedTemplateId: string | null
  onSelect: (templateId: string) => void
}

export default function ReportTemplates({ selectedTemplateId, onSelect }: ReportTemplatesProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const { data: templates, isLoading } = useReportTemplates()

  const scrollTemplates = () => {
    const viewport = viewportRef.current
    if (!viewport) return

    const atEnd = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 1
    viewport.scrollBy({ left: atEnd ? -viewport.clientWidth : viewport.clientWidth * 0.8, behavior: 'smooth' })
  }

  const decorated = decorateTemplates(templates)

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
          {isLoading || !templates
            ? [0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-48 shrink-0 rounded-xl border border-[#232D47] bg-[#0E182D]/40 p-3">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <Skeleton className="mt-2 h-4 w-32" />
                  <Skeleton className="mt-1.5 h-3 w-full" />
                </div>
              ))
            : decorated.map(({ id, name, description, Icon, iconClassName }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelect(id)}
                  className={`w-48 shrink-0 cursor-pointer rounded-xl border p-3 text-left transition-all active:scale-95 ${
                    id === selectedTemplateId ? 'border-sky-500/50 bg-sky-500/5' : 'border-[#232D47] bg-[#0E182D]/40 hover:bg-white/5'
                  }`}
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <TruncateTooltip as="p" className="mt-2 w-full truncate font-semibold text-white" tooltip={name}>
                    {name}
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
