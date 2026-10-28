import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { axiosInstance } from '@/lib/axios'
import { toastApiError } from '@/lib/toast'
import type { NotificationFilter, NotificationsPage } from '@/types/notifications'

export const notificationKeys = {
  unreadCount: ['notifications', 'unreadCount'] as const,
  lists: ['notifications', 'list'] as const,
  list: (filter: NotificationFilter, pageSize: number) => ['notifications', 'list', filter, pageSize] as const,
}

// Applies a change to every loaded page of every notification list (dropdown, each tab).
function updateLoadedNotifications(
  queryClient: ReturnType<typeof useQueryClient>,
  update: (notification: NotificationsPage['items'][number]) => NotificationsPage['items'][number],
) {
  queryClient.setQueriesData<InfiniteData<NotificationsPage>>({ queryKey: notificationKeys.lists }, (prev) =>
    prev ? { ...prev, pages: prev.pages.map((page) => ({ ...page, items: page.items.map(update) })) } : prev,
  )
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

// Paged by cursor, newest first; "Load more" fetches the next page.
export function useNotificationsList(filter: NotificationFilter, pageSize: number) {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(filter, pageSize),
    queryFn: async ({ pageParam }) =>
      (await axiosInstance.get<NotificationsPage>('/notifications', { params: { ...filter, limit: pageSize, cursor: pageParam } })).data,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // Switching tabs keeps the previous tab's rows (and the badge counts) on screen until the new one loads.
    placeholderData: (prev) => prev,
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
      updateLoadedNotifications(queryClient, (n) => (n.id === id ? { ...n, read: true } : n))
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
      updateLoadedNotifications(queryClient, (n) => ({ ...n, read: true }))
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount })
    },
    onError: (err) => toastApiError(err, 'Failed to mark all notifications as read'),
  })
}
