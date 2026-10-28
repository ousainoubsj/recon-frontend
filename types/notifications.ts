// Mirrors the Prisma Notification model exactly (recon-backend/prisma/schema.prisma) —
// GET /notifications returns a bare array of these, newest first.
export type Notification = {
  id: string
  userId: string
  organizationId: string
  type: string
  message: string
  entityType: string | null
  entityId: string | null
  read: boolean
  createdAt: string
}

// GET /notifications: one page, newest first. countsByType covers all of the user's notifications (tab badges).
export type NotificationsPage = {
  items: Notification[]
  total: number
  nextCursor: string | null
  countsByType: Record<string, number>
}

// Either the types to keep or the types to drop; the catch-all tab is "everything not in the other tabs".
export type NotificationFilter = { types?: string[]; excludeTypes?: string[] }
