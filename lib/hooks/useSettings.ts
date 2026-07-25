import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as settingsApi from '@/lib/api/settings'
import { toast, toastApiError } from '@/lib/toast'
import type {
  UpdateNotificationPreferencesInput,
  UpdateOrganizationInfoInput,
  UpdateReconciliationDefaultsInput,
} from '@/types/settings'

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
    },
    onError: (err) => toastApiError(err, 'Failed to save organization information'),
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
      toast.success('Notification preferences updated')
    },
    onError: (err) => toastApiError(err, 'Failed to update notification preferences'),
  })
}
