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
import { toast } from '@/lib/toast'
import { useOrganizationInfo, useReconciliationDefaults, useUpdateOrganizationInfo, useUpdateReconciliationDefaults } from '@/lib/hooks/useSettings'

const EMPTY_ORG_DRAFT: OrgInfoDraft = { name: '', orgType: '', country: '', dateFormat: '', currency: '' }
const EMPTY_RECON_DRAFT: ReconDefaultsDraft = { defaultAmountTolerance: '', defaultDateToleranceDays: '' }
// Mirrors the numeric payload SettingsDangerZone's "Reset to Default" sends —
// keep the two in sync if those defaults ever change.
const RESET_RECON_DRAFT: ReconDefaultsDraft = {
  defaultAmountTolerance: '0.01',
  defaultDateToleranceDays: '3',
}

export default function SettingsPageClient() {
  const queryClient = useQueryClient()
  const { data: activeOrg, isPending: isActiveOrgLoading } = authClient.useActiveOrganization()
  const { data: orgInfo, isLoading: isOrgInfoLoading } = useOrganizationInfo()
  const { data: reconDefaults, isLoading: isReconDefaultsLoading } = useReconciliationDefaults()
  const updateOrgInfo = useUpdateOrganizationInfo()
  const updateReconDefaults = useUpdateReconciliationDefaults()

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

  const isSaving = updateOrgInfo.isPending || updateReconDefaults.isPending

  const handleSave = async () => {
    const tasks: Promise<unknown>[] = []

    if (activeOrg) {
      tasks.push(
        authClient.organization.update({
          data: { name: orgDraft.name.trim() || activeOrg.name },
          organizationId: activeOrg.id,
        }),
      )
    }

    tasks.push(
      updateOrgInfo.mutateAsync({
        orgType: orgDraft.orgType || null,
        country: orgDraft.country || null,
        dateFormat: orgDraft.dateFormat || null,
        currency: orgDraft.currency || null,
      }),
    )

    const parsedTolerance = Number(reconDraft.defaultAmountTolerance)
    const parsedDays = Number(reconDraft.defaultDateToleranceDays)
    tasks.push(
      updateReconDefaults.mutateAsync({
        defaultAmountTolerance: Number.isFinite(parsedTolerance) ? parsedTolerance : null,
        defaultDateToleranceDays: Number.isFinite(parsedDays) ? parsedDays : null,
      }),
    )

    const results = await Promise.allSettled(tasks)
    // Both settingsService's own diff-logging and Better Auth's org-name hook
    // write audit entries independently and concurrently above — invalidate
    // again once everything has actually settled, so a name change that
    // finishes after updateOrgInfo's own onSuccess invalidation isn't missed.
    queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    if (results.every((r) => r.status === 'fulfilled')) toast.success('Settings saved')
  }

  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0 space-y-6">
          <SettingsHeader onSave={handleSave} isSaving={isSaving} />

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[30%_1fr]">
            <SettingsOrganizationInfo
              draft={orgDraft}
              onChange={setOrgDraft}
              isLoading={isActiveOrgLoading || isOrgInfoLoading}
            />
            <div className="min-w-0 space-y-6">
              <SettingsRecentActivity />
              <SettingsNotifications />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SettingsReconciliationDefaults draft={reconDraft} onChange={setReconDraft} isLoading={isReconDefaultsLoading} />
          <SettingsDangerZone onReset={() => setReconDraft(RESET_RECON_DRAFT)} />
          <SettingsQuickLinks />
        </div>
      </div>
    </div>
  )
}
