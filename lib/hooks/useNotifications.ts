import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from '@/lib/axios'

export const notificationKeys = {
  unreadCount: ['notifications', 'unreadCount'] as const,
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
