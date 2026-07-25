import { apiFetch } from './client'
import type {
  NotificationPreferences,
  OrganizationInfo,
  OrganizationLogoPresign,
  ReconciliationDefaults,
  UpdateNotificationPreferencesInput,
  UpdateOrganizationInfoInput,
  UpdateReconciliationDefaultsInput,
} from '@/types/settings'

export function getOrganizationInfo() {
  return apiFetch.get<OrganizationInfo>('/settings/organization-info')
}

export function updateOrganizationInfo(data: UpdateOrganizationInfoInput) {
  return apiFetch.patch<OrganizationInfo>('/settings/organization-info', data)
}

export function getReconciliationDefaults() {
  return apiFetch.get<ReconciliationDefaults>('/settings/reconciliation-defaults')
}

export function updateReconciliationDefaults(data: UpdateReconciliationDefaultsInput) {
  return apiFetch.patch<ReconciliationDefaults>('/settings/reconciliation-defaults', data)
}

export function getNotificationPreferences() {
  return apiFetch.get<NotificationPreferences>('/settings/notifications')
}

export function updateNotificationPreferences(data: UpdateNotificationPreferencesInput) {
  return apiFetch.patch<NotificationPreferences>('/settings/notifications', data)
}

export function presignOrganizationLogo(input: { filename: string; contentType: string; size: number }) {
  return apiFetch.post<OrganizationLogoPresign>('/settings/organization-logo/presign', input)
}
