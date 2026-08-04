import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '@/lib/axios'
import { toastApiError } from '@/lib/toast'
import type { Notification } from '@/types/notifications'

export const notificationKeys = {
  unreadCount: ['notifications', 'unreadCount'] as const,
  list: ['notifications', 'list'] as const,
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: async () => (await axiosInstance.get<{ count: number }>('/notifications/unread-count')).data,
    // Silent failure, no toast — a missed notification-count refresh isn't
    // worth interrupting the user, unlike a failed page-content load.
    throwOnError: false,
  })
}

// GET /notifications has no pagination support server-side (returns every
// notification the user has) — callers that need "Load more" behavior slice
// this list client-side rather than re-fetching with an offset.
export function useNotificationsList() {
  return useQuery({
    queryKey: notificationKeys.list,
    queryFn: async () => (await axiosInstance.get<Notification[]>('/notifications')).data,
    throwOnError: false,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.post(`/notifications/${id}/read`)
    },
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Notification[]>(notificationKeys.list, (prev) => prev?.map((n) => (n.id === id ? { ...n, read: true } : n)))
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount })
    },
    onError: (err) => toastApiError(err, 'Failed to mark notification as read'),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await axiosInstance.post('/notifications/read-all')
    },
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(notificationKeys.list, (prev) => prev?.map((n) => ({ ...n, read: true })))
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount })
    },
    onError: (err) => toastApiError(err, 'Failed to mark all notifications as read'),
  })
}
