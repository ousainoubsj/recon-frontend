'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowRight, ChevronRight, FileSpreadsheet, FileText, Loader2, MoreVertical, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { Menu } from '@base-ui/react/menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteReport, useDrafts } from '@/lib/hooks/useReports'
import { useDeleteMatchRuleTemplate, useMatchRuleTemplates } from '@/lib/hooks/useMatchRuleTemplates'
import { useReconciliationDefaults, useUpdateReconciliationDefaults } from '@/lib/hooks/useSettings'
import { authClient } from '@/lib/auth-client'
import { formatTimeAgo } from '@/lib/format'
import { toast } from '@/lib/toast'
import { EmptyNeutralState } from './EmptyStates'
import type { MatchRuleTemplate } from '@/types/matchRuleTemplates'
import type { Report } from '@/types/reports'

// Cycled by index since a real template has no per-item icon/color of its
// own (unlike the mock's hand-picked icon per card) — still gives each card
// visual variety instead of all looking identical.
const TEMPLATE_ICON_STYLES = [
  'bg-emerald-500/15 text-emerald-400',
  'bg-indigo-500/15 text-indigo-300',
  'bg-orange-500/15 text-orange-400',
  'bg-pink-500/15 text-pink-400',
]

function fileTypeLabel(filename: string | null) {
  const ext = filename?.split('.').pop()?.toLowerCase()
  if (ext === 'xlsx' || ext === 'xls') return { icon: '/icons/xls.png', label: ext.toUpperCase() }
  return { icon: '/icons/csv.png', label: 'CSV' }
}

function PanelHeader({ title, viewAllLabel, onViewAll }: { title: string; viewAllLabel: string; onViewAll: () => void }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <button
        type="button"
        onClick={onViewAll}
        className="flex cursor-pointer items-center gap-1 text-sm font-medium text-sky-400 hover:underline"
      >
        {viewAllLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function TemplateCard({
  template,
  index,
  isDefault,
  isAdmin,
  onRequestRemove,
  onToggleDefault,
}: {
  template: MatchRuleTemplate
  index: number
  isDefault: boolean
  isAdmin: boolean
  onRequestRemove: (template: MatchRuleTemplate) => void
  onToggleDefault: (template: MatchRuleTemplate) => void
}) {
  const iconStyle = TEMPLATE_ICON_STYLES[index % TEMPLATE_ICON_STYLES.length]
  return (
    <div className="w-40 shrink-0 rounded-xl bg-[radial-gradient(100%_100%_at_0%_0%,rgba(255,255,255,0.45),rgba(255,255,255,0)_60%)] p-px sm:w-auto">
      <div className="h-full rounded-lg bg-[#111C3D]/90 px-4 py-5 space-y-2">
        <div className="flex items-start justify-between">
          <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconStyle}`}>
            <SlidersHorizontal className="h-5 w-5" />
          </span>
          {/* Setting/clearing the org default is admin-only (matches
              settingsService.js's organization:update gate) — hidden rather
              than disabled for non-admins, same pattern as elsewhere. */}
          {isAdmin && (
            <Menu.Root>
              <Menu.Trigger aria-label="More options" className="shrink-0 cursor-pointer text-slate-400 outline-none hover:text-white">
                <MoreVertical className="h-4 w-4" />
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Positioner side="bottom" align="end" sideOffset={6} className="z-50">
                  <Menu.Popup className="min-w-36 rounded-lg border border-[#232D47] bg-[#0A1128] shadow-lg shadow-black/40 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
                    <Menu.Item
                      onClick={() => onToggleDefault(template)}
                      className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-slate-200 outline-none transition-colors duration-300 data-highlighted:bg-white/5"
                    >
                      {isDefault ? 'Remove as Default' : 'Make Default'}
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => onRequestRemove(template)}
                      className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-rose-400 outline-none transition-colors duration-300 data-highlighted:bg-rose-500/10 data-highlighted:text-rose-300"
                    >
                      Delete Template
                    </Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          )}
        </div>
        <TruncateTooltip as="p" className="mt-3 truncate text-sm font-semibold text-white" tooltip={template.name}>
          {template.name}
        </TruncateTooltip>
        <TruncateTooltip
          as="p"
          className="mt-1 truncate text-xs text-slate-400"
          tooltip={template.lastUsedAt ? `Last used ${formatTimeAgo(template.lastUsedAt)}` : 'Never used'}
        >
          {template.lastUsedAt ? `Last used ${formatTimeAgo(template.lastUsedAt)}` : 'Never used'}
        </TruncateTooltip>
        <p className="mt-1.5 text-xs font-medium text-emerald-400">
          {template.useCount} run{template.useCount === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  )
}

function TemplateCardSkeleton() {
  return (
    <div className="w-40 shrink-0 rounded-xl border border-[#232D47] sm:w-auto">
      <div className="h-full rounded-lg px-4 py-5 space-y-2.5">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="mt-3 h-4 w-24" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

function DraftRow({
  draft,
  onContinue,
  onRequestRemove,
}: {
  draft: Report
  onContinue: (id: string) => void
  onRequestRemove: (draft: Report) => void
}) {
  const fileA = fileTypeLabel(draft.fileAName)
  const fileB = fileTypeLabel(draft.fileBName)
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0.5 last:pb-0.5">
      <div className="min-w-0 flex-1">
        <TruncateTooltip as="p" className="truncate text-sm font-semibold text-white" tooltip={draft.name ?? 'Untitled Reconciliation'}>
          {draft.name ?? 'Untitled Reconciliation'}
        </TruncateTooltip>
        <div className="mt-1.5 flex items-center gap-2">
          {[fileA, fileB].map(({ icon, label }, i) => (
            <span key={i} className="flex items-center gap-1 text-xs text-slate-400">
              <Image src={icon} alt="" width={14} height={14} className="h-3.5 w-3.5" />
              {label}
            </span>
          ))}
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
          <FileText className="h-3.5 w-3.5" />
          Last edited {formatTimeAgo(draft.updatedAt)}
        </p>
      </div>

      <div className="w-24 shrink-0">
        <p className="text-right text-sm font-semibold text-white">{draft.progress}%</p>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#1B2540]">
          <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${draft.progress}%` }} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onContinue(draft.id)}
        className="shrink-0 cursor-pointer rounded-lg border border-[#232D47] px-3 py-1.5 text-xs font-medium text-white hover:bg-white/5"
      >
        Continue
      </button>

      <Menu.Root>
        <Menu.Trigger aria-label="More options" className="shrink-0 cursor-pointer text-slate-400 outline-none hover:text-white">
          <MoreVertical className="h-4 w-4" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner side="bottom" align="end" sideOffset={6} className="z-50">
            <Menu.Popup className="min-w-36 rounded-lg border border-[#232D47] bg-[#0A1128] shadow-lg shadow-black/40 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
              <Menu.Item
                onClick={() => onRequestRemove(draft)}
                className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-rose-400 outline-none transition-colors duration-300 data-highlighted:bg-rose-500/10 data-highlighted:text-rose-300"
              >
                Remove Draft
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  )
}

type ReconciliationRecentActivityProps = {
  onViewAllTemplates: () => void
  onViewAllDrafts: () => void
}

type PendingRemoval = { kind: 'draft'; report: Report } | { kind: 'template'; template: MatchRuleTemplate }

export default function ReconciliationRecentActivity({ onViewAllTemplates, onViewAllDrafts }: ReconciliationRecentActivityProps) {
  const router = useRouter()
  const templatesViewportRef = useRef<HTMLDivElement>(null)
  const { data: templates, isLoading: isTemplatesLoading } = useMatchRuleTemplates()
  const { data: drafts, isLoading: isDraftsLoading } = useDrafts()
  const deleteReport = useDeleteReport()
  const deleteTemplate = useDeleteMatchRuleTemplate()
  const [pendingRemove, setPendingRemove] = useState<PendingRemoval | null>(null)

  const { data: activeMemberRole } = authClient.useActiveMemberRole()
  const isAdmin = activeMemberRole?.role === 'admin'
  const { data: reconciliationDefaults } = useReconciliationDefaults()
  const updateReconDefaults = useUpdateReconciliationDefaults()
  const enforcedTemplateId = reconciliationDefaults?.enforcedMatchRuleTemplateId

  const handleToggleDefault = (template: MatchRuleTemplate) => {
    const nextId = enforcedTemplateId === template.id ? null : template.id
    updateReconDefaults.mutate(
      { enforcedMatchRuleTemplateId: nextId },
      { onSuccess: () => toast.success(nextId ? `${template.name} set as default` : 'Default template cleared') },
    )
  }

  const recentTemplates = [...(templates ?? [])]
    .sort((a, b) => new Date(b.lastUsedAt ?? b.createdAt).getTime() - new Date(a.lastUsedAt ?? a.createdAt).getTime())
    .slice(0, 4)
  const recentDrafts = (drafts ?? []).slice(0, 2)

  const scrollTemplates = () => {
    const viewport = templatesViewportRef.current
    if (!viewport) return

    const atEnd = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 1
    viewport.scrollBy({ left: atEnd ? -viewport.clientWidth : viewport.clientWidth * 0.8, behavior: 'smooth' })
  }

  const handleConfirmRemove = () => {
    if (!pendingRemove) return
    if (pendingRemove.kind === 'draft') {
      deleteReport.mutate(pendingRemove.report.id, { onSuccess: () => setPendingRemove(null) })
    } else {
      deleteTemplate.mutate(pendingRemove.template.id, { onSuccess: () => setPendingRemove(null) })
    }
  }
  const isRemovePending = pendingRemove?.kind === 'draft' ? deleteReport.isPending : deleteTemplate.isPending

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
      <div className="relative min-w-0 rounded-2xl border border-[#232D47] bg-[#0D152A]/50 p-5">
        <PanelHeader title="Recent Templates" viewAllLabel="View all templates" onViewAll={onViewAllTemplates} />

        {isTemplatesLoading || !templates ? (
          <div className="flex gap-3 pb-3 sm:grid sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <TemplateCardSkeleton key={i} />
            ))}
          </div>
        ) : recentTemplates.length === 0 ? (
          <EmptyNeutralState title="No saved templates yet" subtitle="Save matching rules from the wizard to reuse them here." />
        ) : (
          <ScrollArea className="w-full min-w-0" viewportRef={templatesViewportRef}>
            <div className="flex gap-3 pb-3 sm:grid sm:grid-cols-4">
              {recentTemplates.map((template, i) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  index={i}
                  isDefault={template.id === enforcedTemplateId}
                  isAdmin={isAdmin}
                  onRequestRemove={(t) => setPendingRemove({ kind: 'template', template: t })}
                  onToggleDefault={handleToggleDefault}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        <button
          type="button"
          aria-label="Scroll templates"
          onClick={scrollTemplates}
          className="absolute top-1/2 -right-4 hidden h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#232D47] bg-[#141B36] text-slate-300 shadow-md lg:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0D152A]/50 p-5">
        <PanelHeader title="Recent Drafts" viewAllLabel="View all drafts" onViewAll={onViewAllDrafts} />

        {isDraftsLoading || !drafts ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <FileSpreadsheet className="h-8 w-8 shrink-0 text-slate-700" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : recentDrafts.length === 0 ? (
          <EmptyNeutralState title="No unfinished reconciliations" subtitle="Drafts you haven't finished will show up here." />
        ) : (
          <div className="divide-y divide-[#1B2540]">
            {recentDrafts.map((draft) => (
              <DraftRow
                key={draft.id}
                draft={draft}
                onContinue={(id) => router.push(`/dashboard/reconciliation-process/${id}`)}
                onRequestRemove={(d) => setPendingRemove({ kind: 'draft', report: d })}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={pendingRemove != null} onOpenChange={(next) => !next && setPendingRemove(null)}>
        <DialogContent className="border border-[#232D47] bg-[#0E182D] p-3.5 text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-rose-400">
              {pendingRemove?.kind === 'draft' ? 'Remove draft?' : 'Delete template?'}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              This permanently deletes &quot;
              {pendingRemove?.kind === 'draft' ? (pendingRemove.report.name ?? 'Untitled Reconciliation') : pendingRemove?.template.name}
              &quot; and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-1 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingRemove(null)}
              className="cursor-pointer border-[#232D47] bg-transparent p-4 text-white transition-all duration-300 hover:bg-white/5 active:scale-95"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmRemove}
              disabled={isRemovePending}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-md bg-rose-500 p-4 font-medium text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRemovePending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isRemovePending
                ? pendingRemove?.kind === 'draft'
                  ? 'Removing...'
                  : 'Deleting...'
                : pendingRemove?.kind === 'draft'
                  ? 'Remove'
                  : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
