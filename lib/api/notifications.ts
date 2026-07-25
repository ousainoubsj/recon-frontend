import { apiFetch } from './client'

export function getUnreadCount() {
  return apiFetch.get<{ count: number }>('/notifications/unread-count')
}
