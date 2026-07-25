import { useQuery } from '@tanstack/react-query'
import * as notificationsApi from '@/lib/api/notifications'

export const notificationKeys = {
  unreadCount: ['notifications', 'unreadCount'] as const,
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: () => notificationsApi.getUnreadCount(),
    // Silent failure, no toast — a missed notification-count refresh isn't
    // worth interrupting the user, unlike a failed page-content load.
    throwOnError: false,
  })
}
