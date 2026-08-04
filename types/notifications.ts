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
