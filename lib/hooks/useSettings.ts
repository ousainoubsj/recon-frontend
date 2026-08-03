import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { axiosInstance } from '@/lib/axios'
import { toast, toastApiError } from '@/lib/toast'
import type {
  NotificationPreferences,
  OrganizationInfo,
  OrganizationLogoPresign,
  ReconciliationDefaults,
  UpdateNotificationPreferencesInput,
  UpdateOrganizationInfoInput,
  UpdateReconciliationDefaultsInput,
} from '@/types/settings'

const LOGO_MAX_SIZE_BYTES = 2 * 1024 * 1024

export const settingsKeys = {
  organizationInfo: ['settings', 'organizationInfo'] as const,
  reconciliationDefaults: ['settings', 'reconciliationDefaults'] as const,
  notifications: ['settings', 'notifications'] as const,
}

export function useOrganizationInfo() {
  return useQuery({
    queryKey: settingsKeys.organizationInfo,
    queryFn: async () => {
      try {
        return (await axiosInstance.get<OrganizationInfo>('/settings/organization-info')).data
      } catch (err) {
        toastApiError(err, 'Failed to load organization information')
        throw err
      }
    },
  })
}

export function useUpdateOrganizationInfo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateOrganizationInfoInput) =>
      (await axiosInstance.patch<OrganizationInfo>('/settings/organization-info', data)).data,
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.organizationInfo, data)
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    },
    onError: (err) => toastApiError(err, 'Failed to save organization information'),
  })
}

// Not a plain REST resource — presign (recon-backend) → direct PUT to R2 →
// authClient.organization.update (Better Auth) — three steps across two
// different backends chained into one mutation, same split as every other
// Better-Auth-plugin call in this app, just with a REST step in the middle.
export function useUploadOrgLogo() {
  const queryClient = useQueryClient()
  const { data: activeOrg } = authClient.useActiveOrganization()

  return useMutation({
    mutationFn: async (file: File) => {
      if (!activeOrg) throw new Error('No active organization')
      if (file.size > LOGO_MAX_SIZE_BYTES) throw new Error('Logo must be 2MB or smaller')
      if (file.type !== 'image/png' && file.type !== 'image/svg+xml') throw new Error('Only PNG or SVG files are accepted')

      const { url, publicUrl } = (
        await axiosInstance.post<OrganizationLogoPresign>('/settings/organization-logo/presign', {
          filename: file.name,
          contentType: file.type,
          size: file.size,
        })
      ).data
      const putRes = await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      if (!putRes.ok) throw new Error('Upload failed')

      const { error } = await authClient.organization.update({ data: { logo: publicUrl }, organizationId: activeOrg.id })
      if (error) throw new Error(error.message ?? 'Failed to update logo')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
      toast.success('Logo updated')
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to update logo'),
  })
}

const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024
const AVATAR_ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

// Same three-step shape as useUploadOrgLogo (presign → direct PUT to R2 →
// Better Auth), just per-user: authClient.updateUser({ image }) instead of
// authClient.organization.update, and no active-org dependency.
export function useUploadAvatar() {
  return useMutation({
    mutationFn: async (file: File) => {
      if (file.size > AVATAR_MAX_SIZE_BYTES) throw new Error('Photo must be 2MB or smaller')
      if (!AVATAR_ALLOWED_TYPES.has(file.type)) throw new Error('Only PNG, JPEG, or WEBP files are accepted')

      const { url, publicUrl } = (
        await axiosInstance.post<OrganizationLogoPresign>('/settings/avatar/presign', {
          filename: file.name,
          contentType: file.type,
          size: file.size,
        })
      ).data
      const putRes = await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      if (!putRes.ok) throw new Error('Upload failed')

      const { error } = await authClient.updateUser({ image: publicUrl })
      if (error) throw new Error(error.message ?? 'Failed to update photo')
    },
    onSuccess: () => toast.success('Profile photo updated'),
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to update photo'),
  })
}

export function useReconciliationDefaults() {
  return useQuery({
    queryKey: settingsKeys.reconciliationDefaults,
    queryFn: async () => {
      try {
        return (await axiosInstance.get<ReconciliationDefaults>('/settings/reconciliation-defaults')).data
      } catch (err) {
        toastApiError(err, 'Failed to load reconciliation defaults')
        throw err
      }
    },
  })
}

export function useUpdateReconciliationDefaults() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateReconciliationDefaultsInput) =>
      (await axiosInstance.patch<ReconciliationDefaults>('/settings/reconciliation-defaults', data)).data,
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.reconciliationDefaults, data)
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    },
    onError: (err) => toastApiError(err, 'Failed to save reconciliation defaults'),
  })
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: settingsKeys.notifications,
    queryFn: async () => {
      try {
        return (await axiosInstance.get<NotificationPreferences>('/settings/notifications')).data
      } catch (err) {
        toastApiError(err, 'Failed to load notification preferences')
        throw err
      }
    },
  })
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateNotificationPreferencesInput) =>
      (await axiosInstance.patch<NotificationPreferences>('/settings/notifications', data)).data,
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.notifications, data)
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
      toast.success('Notification preferences updated')
    },
    onError: (err) => toastApiError(err, 'Failed to update notification preferences'),
  })
}
