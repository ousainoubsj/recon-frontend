import { FileBarChart2, FileChartColumn, FilePlus2, FileWarning, Presentation, type LucideIcon } from 'lucide-react'
import type { ReportSections, ReportTemplate } from '@/types/reports'

// Sentinel for "no template" (the Custom Report card) — never collides with
// a real template's uuid, so `selectedTemplateId` can stay a plain string
// without a separate tri-state for "explicitly Custom" vs "not chosen yet".
export const CUSTOM_TEMPLATE_ID = 'custom'
export const DEFAULT_TEMPLATE_NAME = 'Reconciliation Summary'

export type CustomizeKey = 'summary' | 'matchStatistics' | 'breakAnalysis' | 'unmatchedDetails' | 'chartsAndGraphs'

export const DEFAULT_CUSTOMIZE: Record<CustomizeKey, boolean> = {
  summary: true,
  matchStatistics: true,
  breakAnalysis: true,
  unmatchedDetails: true,
  chartsAndGraphs: false,
}

type Decoration = { Icon: LucideIcon; iconClassName: string; badge: string; badgeClassName: string }

// The 4 system templates seeded backend-side (prisma migration
// 20260723131838) match these names — and their descriptions — verbatim.
// No icon/badge/color concept exists in the backend model, so that stays
// frontend-only decoration, keyed by name.
const KNOWN_DECORATIONS: Record<string, Decoration> = {
  'Executive Summary': {
    Icon: Presentation,
    iconClassName: 'bg-violet-500/15 text-violet-400',
    badge: 'POPULAR',
    badgeClassName: 'bg-violet-500/15 text-violet-300',
  },
  'Reconciliation Summary': {
    Icon: FileChartColumn,
    iconClassName: 'bg-sky-500/15 text-sky-400',
    badge: 'POPULAR',
    badgeClassName: 'bg-sky-500/15 text-sky-300',
  },
  'Unmatched Transactions': {
    Icon: FileWarning,
    iconClassName: 'bg-amber-500/15 text-amber-400',
    badge: 'POPULAR',
    badgeClassName: 'bg-amber-500/15 text-amber-300',
  },
  'Breakdown Analysis': {
    Icon: FileBarChart2,
    iconClassName: 'bg-emerald-500/15 text-emerald-400',
    badge: 'POPULAR',
    badgeClassName: 'bg-emerald-500/15 text-emerald-300',
  },
}

const KNOWN_ORDER = Object.keys(KNOWN_DECORATIONS)

export type DecoratedTemplate = Decoration & {
  id: string
  name: string
  description: string
  sections: ReportSections | null
}

// Maps real backend templates onto the known 4 (in the mock's original
// visual order, ignoring any other org-created templates — no
// create/delete-template UI this phase, see docs/frontend-wiring-plan.md
// §3 Phase 8), then always appends the Custom Report pseudo-card.
export function decorateTemplates(templates: ReportTemplate[] | undefined): DecoratedTemplate[] {
  const known = KNOWN_ORDER.map((name) => templates?.find((t) => t.isSystem && t.name === name))
    .filter((t): t is ReportTemplate => !!t)
    .map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description ?? '',
      sections: t.sections,
      ...KNOWN_DECORATIONS[t.name],
    }))

  return [
    ...known,
    {
      id: CUSTOM_TEMPLATE_ID,
      name: 'Custom Report',
      description: 'Build your own report with custom fields and filters.',
      Icon: FilePlus2,
      iconClassName: 'bg-slate-500/15 text-slate-300',
      badge: 'CUSTOM',
      badgeClassName: 'bg-slate-500/15 text-slate-300',
      sections: null,
    },
  ]
}
