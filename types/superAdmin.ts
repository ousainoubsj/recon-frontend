import type { MemberRole } from '@/types/team'

// Platform operators (docs/SUPER_ADMIN_PLAN.md). Separate from the org role on Member.role.
export type PlatformRole = 'owner' | 'admin'
export type PlatformAdminStatus = 'active' | 'suspended' | 'removed'
export type OrganizationStatus = 'active' | 'suspended'

// Added to Better Auth's session user and active member through additionalFields (wired in Step 6).
export type SessionPlatformFields = { platformRole: PlatformRole | null }
export type ActiveMemberSupportFields = { isSupport: boolean }

// GET /super-admin/companies and /super-admin/companies/:id. memberCount excludes support members.
export type Company = {
  id: string
  name: string
  slug: string
  logo: string | null
  status: OrganizationStatus
  createdAt: string
  suspendedAt: string | null
  memberCount: number
  reportCount: number
}

export type CompaniesPage = { items: Company[]; total: number }

export type CompaniesParams = {
  q?: string
  status?: OrganizationStatus
  offset?: number
  limit?: number
}

// GET /super-admin/admins (owner only). Removed admins are never listed.
export type PlatformAdmin = {
  id: string
  name: string
  email: string
  image: string | null
  platformRole: PlatformRole
  platformStatus: Exclude<PlatformAdminStatus, 'removed'>
  createdAt: string
  companyCount: number
}

export type PlatformAdminsPage = { items: PlatformAdmin[]; total: number }

// q matches name or email, as in StaffLedger's admins tab.
export type PlatformAdminsParams = {
  q?: string
  offset?: number
  limit?: number
}

// GET and PUT /super-admin/admins/:userId/companies. An empty list means no company access.
export type AdminCompanies = { organizationIds: string[] }

export type CreateCompanyInput = { name: string; firstAdminEmail: string }
export type UpdateCompanyInput = { name: string }
export type InviteCompanyUserInput = { email: string; role: MemberRole }
export type InvitePlatformAdminInput = { name: string; email: string }

// POST /super-admin/companies/:id/enter
export type EnterCompanyResult = { organizationId: string; name: string }
