'use client'

import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import SettingsDangerZone from '@/components/dashboard/SettingsDangerZone'
import SettingsHeader from '@/components/dashboard/SettingsHeader'
import SettingsNotifications from '@/components/dashboard/SettingsNotifications'
import SettingsOrganizationInfo, { type OrgInfoDraft } from '@/components/dashboard/SettingsOrganizationInfo'
import SettingsQuickLinks from '@/components/dashboard/SettingsQuickLinks'
import SettingsReconciliationDefaults, {
  type ReconDefaultsDraft,
} from '@/components/dashboard/SettingsReconciliationDefaults'
import SettingsRecentActivity from '@/components/dashboard/SettingsRecentActivity'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage, toast } from '@/lib/toast'
import { useOrganizationInfo, useReconciliationDefaults, useUpdateOrganizationInfo, useUpdateReconciliationDefaults } from '@/lib/hooks/useSettings'
import { useMatchRuleTemplates } from '@/lib/hooks/useMatchRuleTemplates'

const EMPTY_ORG_DRAFT: OrgInfoDraft = { name: '', orgType: '', country: '', dateFormat: '', currency: '' }
const EMPTY_RECON_DRAFT: ReconDefaultsDraft = { defaultAmountTolerance: '', defaultDateToleranceDays: '' }
// Mirrors the numeric payload SettingsDangerZone's "Reset to Default" sends —
// keep the two in sync if those defaults ever change.
const RESET_RECON_DRAFT: ReconDefaultsDraft = {
  defaultAmountTolerance: '0.01',
  defaultDateToleranceDays: '3',
}

const ORG_FIELD_LABELS: Record<keyof OrgInfoDraft, string> = {
  name: 'Organization name',
  orgType: 'Organization type',
  country: 'Country',
  dateFormat: 'Date format',
  currency: 'Currency',
}

const RECON_FIELD_LABELS: Record<keyof ReconDefaultsDraft, string> = {
  defaultAmountTolerance: 'Match tolerance',
  defaultDateToleranceDays: 'Date tolerance',
}

export default function SettingsPageClient() {
  const queryClient = useQueryClient()
  const { data: activeOrg, isPending: isActiveOrgLoading } = authClient.useActiveOrganization()
  const { data: orgInfo, isLoading: isOrgInfoLoading } = useOrganizationInfo()
  const { data: reconDefaults, isLoading: isReconDefaultsLoading } = useReconciliationDefaults()
  const updateOrgInfo = useUpdateOrganizationInfo()
  const updateReconDefaults = useUpdateReconciliationDefaults()
  // Same isAdmin pattern as SettingsNotifications.tsx's weeklyDigest gate —
  // only an admin may designate the org's enforced matching-rules template.
  const { data: activeMemberRole } = authClient.useActiveMemberRole()
  const isAdmin = activeMemberRole?.role === 'admin'
  const { data: matchRuleTemplates, isLoading: isTemplatesLoading } = useMatchRuleTemplates()

  const [orgDraft, setOrgDraft] = useState<OrgInfoDraft>(EMPTY_ORG_DRAFT)
  const [reconDraft, setReconDraft] = useState<ReconDefaultsDraft>(EMPTY_RECON_DRAFT)

  const hydratedOrg = useRef(false)
  const hydratedRecon = useRef(false)

  useEffect(() => {
    if (hydratedOrg.current || !activeOrg || !orgInfo) return
    hydratedOrg.current = true
    setOrgDraft({
      name: activeOrg.name ?? '',
      orgType: orgInfo.orgType ?? 'Financial Services',
      country: orgInfo.country ?? 'United Kingdom',
      dateFormat: orgInfo.dateFormat ?? 'DD MMM YYYY',
      currency: orgInfo.currency ?? 'GBP',
    })
  }, [activeOrg, orgInfo])

  useEffect(() => {
    if (hydratedRecon.current || !reconDefaults) return
    hydratedRecon.current = true
    setReconDraft({
      defaultAmountTolerance: reconDefaults.defaultAmountTolerance ?? '0.01',
      defaultDateToleranceDays:
        reconDefaults.defaultDateToleranceDays != null ? String(reconDefaults.defaultDateToleranceDays) : '3',
    })
  }, [reconDefaults])

  // Organization Name goes through Better Auth directly (not a TanStack Query
  // mutation), so it needs its own manual audit-log invalidation —
  // updateOrgInfo/updateReconDefaults already invalidate ['auditLogs']
  // themselves in useSettings.ts.
  const handleCommitOrgField = async (field: keyof OrgInfoDraft, value: string) => {
    if (field === 'name') {
      const trimmed = value.trim()
      if (!activeOrg || !trimmed || trimmed === activeOrg.name) return
      const { error } = await authClient.organization.update({ data: { name: trimmed }, organizationId: activeOrg.id })
      if (error) {
        toast.error(authErrorMessage(error, 'Failed to update organization name'))
        return
      }
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
      toast.success(`${ORG_FIELD_LABELS.name} updated`)
      return
    }

    const savedValue = orgInfo?.[field] ?? ''
    if (value === savedValue) return
    updateOrgInfo.mutate(
      { [field]: value || null },
      { onSuccess: () => toast.success(`${ORG_FIELD_LABELS[field]} updated`) },
    )
  }

  const handleSelectEnforcedTemplate = (templateId: string | null) => {
    if (templateId === (reconDefaults?.enforcedMatchRuleTemplateId ?? null)) return
    updateReconDefaults.mutate(
      { enforcedMatchRuleTemplateId: templateId },
      { onSuccess: () => toast.success(templateId ? 'Default matching-rules template updated' : 'Default matching-rules template cleared') },
    )
  }

  const handleCommitReconField = (field: keyof ReconDefaultsDraft, value: string) => {
    const savedValue =
      field === 'defaultAmountTolerance'
        ? (reconDefaults?.defaultAmountTolerance ?? '')
        : reconDefaults?.defaultDateToleranceDays != null
          ? String(reconDefaults.defaultDateToleranceDays)
          : ''
    if (value === String(savedValue)) return
    const parsed = Number(value)
    updateReconDefaults.mutate(
      { [field]: Number.isFinite(parsed) ? parsed : null },
      { onSuccess: () => toast.success(`${RECON_FIELD_LABELS[field]} updated`) },
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0 space-y-6">
          <SettingsHeader />

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[30%_1fr]">
            <SettingsOrganizationInfo
              draft={orgDraft}
              onChange={setOrgDraft}
              onCommitField={handleCommitOrgField}
              isLoading={isActiveOrgLoading || isOrgInfoLoading}
            />
            <div className="min-w-0 space-y-6">
              <SettingsRecentActivity />
              <SettingsNotifications />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SettingsReconciliationDefaults
            draft={reconDraft}
            onChange={setReconDraft}
            onCommitField={handleCommitReconField}
            isLoading={isReconDefaultsLoading}
            currency={orgInfo?.currency ?? undefined}
            isAdmin={isAdmin}
            templates={matchRuleTemplates}
            isTemplatesLoading={isTemplatesLoading}
            enforcedTemplateId={reconDefaults?.enforcedMatchRuleTemplateId}
            onSelectEnforcedTemplate={handleSelectEnforcedTemplate}
          />
          <SettingsDangerZone onReset={() => setReconDraft(RESET_RECON_DRAFT)} />
          <SettingsQuickLinks />
        </div>
      </div>
    </div>
  )
}
