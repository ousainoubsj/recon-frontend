import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import * as settingsApi from '@/lib/api/settings'
import { toast, toastApiError } from '@/lib/toast'
import type {
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
        return await settingsApi.getOrganizationInfo()
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
    mutationFn: (data: UpdateOrganizationInfoInput) => settingsApi.updateOrganizationInfo(data),
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

      const { url, publicUrl } = await settingsApi.presignOrganizationLogo({
        filename: file.name,
        contentType: file.type,
        size: file.size,
      })
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

export function useReconciliationDefaults() {
  return useQuery({
    queryKey: settingsKeys.reconciliationDefaults,
    queryFn: async () => {
      try {
        return await settingsApi.getReconciliationDefaults()
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
    mutationFn: (data: UpdateReconciliationDefaultsInput) => settingsApi.updateReconciliationDefaults(data),
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
        return await settingsApi.getNotificationPreferences()
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
    mutationFn: (data: UpdateNotificationPreferencesInput) => settingsApi.updateNotificationPreferences(data),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.notifications, data)
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
      toast.success('Notification preferences updated')
    },
    onError: (err) => toastApiError(err, 'Failed to update notification preferences'),
  })
}
