// Matches recon-backend's actual access-control roles (services/permissions.js
// / auth.js) — the mock's 4-tier "Manager" role doesn't exist server-side,
// so the UI is scoped to these 3 real roles (confirmed decision, not an
// oversight).
export type MemberRole = 'admin' | 'analyst' | 'viewer'
export type MemberStatus = 'active' | 'inactive'

export const ROLE_LABELS: Record<MemberRole, string> = {
  admin: 'Administrator',
  analyst: 'Analyst',
  viewer: 'Viewer',
}

export const ROLE_OPTIONS: MemberRole[] = ['admin', 'analyst', 'viewer']

// Mirrors recon-backend's Member model, joined with the user relation —
// department/status/lastActiveAt are our own custom fields, not part of
// Better Auth's own org-plugin schema.
export type TeamMember = {
  id: string
  organizationId: string
  userId: string
  role: MemberRole
  status: MemberStatus
  department: string | null
  lastActiveAt: string | null
  createdAt: string
  user: { id: string; name: string; email: string; image: string | null }
}

export type TeamStats = {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  administrators: number
  pendingInvites: number
}

export type ListTeamMembersParams = {
  limit?: number
  offset?: number
  q?: string
  role?: MemberRole
  status?: MemberStatus
  department?: string
}

export type UpdateMemberInput = {
  department?: string | null
  status?: MemberStatus
}

// Better Auth's own invitation shape (services/teamService.js has no REST
// mirror for invitations — they live entirely in Better Auth's tables).
export type Invitation = {
  id: string
  organizationId: string
  email: string
  role: MemberRole | null
  status: string
  inviterId: string
  expiresAt: string
  createdAt: string
}

// Shape returned by authClient.organization.getInvitation — the invitee-facing
// single-invitation lookup (used on the accept-invite landing page), distinct
// from the admin-facing Invitation list shape above: it's flattened with the
// org name/slug and inviter's email already joined in by Better Auth, since
// an invitee has no other way to look those up.
export type InvitationDetails = {
  id: string
  organizationId: string
  email: string
  role: MemberRole | null
  status: string
  inviterId: string
  expiresAt: string
  createdAt: string
  organizationName: string
  organizationSlug: string
  inviterEmail: string
}
