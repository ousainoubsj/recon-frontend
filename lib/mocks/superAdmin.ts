// Mock-first stand-in for the /api/super-admin endpoints (docs/SUPER_ADMIN_PLAN.md Step 3). Deleted at wiring.
// State lives in sessionStorage because entering or exiting a company does a full page navigation.
import { ApiError } from '@/lib/axios'
import type {
  AdminCompanies,
  CompaniesPage,
  CompaniesParams,
  Company,
  CreateCompanyInput,
  EnterCompanyResult,
  InviteCompanyUserInput,
  InvitePlatformAdminInput,
  PlatformAdmin,
  PlatformAdminStatus,
  PlatformAdminsPage,
  PlatformAdminsParams,
  PlatformRole,
} from '@/types/superAdmin'

type MockAdmin = Omit<PlatformAdmin, 'companyCount' | 'platformStatus'> & { platformStatus: PlatformAdminStatus }

type MockState = {
  viewerRole: PlatformRole | null
  supportCompanyId: string | null
  companies: Company[]
  admins: MockAdmin[]
  assignments: { userId: string; organizationId: string }[]
}

const STORAGE_KEY = 'reconcil.mock.superAdmin'
const OWNER_ID = 'mock-owner'
const VIEWING_ADMIN_ID = 'mock-admin-awa'
const LATENCY_MS = 400

const COMPANY_NAMES = [
  'Atlantic Freight Ltd', 'Banjul Breweries', 'Kombo Microfinance', 'Gambia Ports Authority', 'Serrekunda Traders',
  'River Gambia Lodges', 'Sahel Telecom', 'Brikama Agro', 'Tanji Fisheries', 'Fajara Medical Group',
  'Coastal Insurance', 'Kerr Serign Motors', 'Senegambia Hotels', 'Bakau Logistics', 'West Coast Energy',
  'Lamin Cement', 'Makasutu Tours', 'Kololi Retail', 'Basse Cotton Co-op', 'Janjanbureh Water',
  'Soma Transport', 'Farafenni Foods',
]

function seedState(): MockState {
  const companies: Company[] = COMPANY_NAMES.map((name, i) => ({
    id: `mock-company-${i + 1}`,
    name,
    slug: `co-mock${i + 1}`,
    status: i % 7 === 3 ? 'suspended' : 'active',
    createdAt: new Date(Date.UTC(2026, 9, 28 - i * 3)).toISOString(),
    suspendedAt: i % 7 === 3 ? new Date(Date.UTC(2026, 9, 20)).toISOString() : null,
    memberCount: 2 + ((i * 5) % 17),
    reportCount: (i * 13) % 90,
  }))
  const admins: MockAdmin[] = [
    { id: OWNER_ID, name: 'Platform Owner', email: 'owner@recon-cil.com', platformRole: 'owner', platformStatus: 'active', createdAt: '2026-06-01T09:00:00.000Z' },
    { id: VIEWING_ADMIN_ID, name: 'Awa Jallow', email: 'awa@recon-cil.com', platformRole: 'admin', platformStatus: 'active', createdAt: '2026-07-14T09:00:00.000Z' },
    { id: 'mock-admin-lamin', name: 'Lamin Ceesay', email: 'lamin@recon-cil.com', platformRole: 'admin', platformStatus: 'active', createdAt: '2026-08-02T09:00:00.000Z' },
    { id: 'mock-admin-fatou', name: 'Fatou Sowe', email: 'fatou@recon-cil.com', platformRole: 'admin', platformStatus: 'suspended', createdAt: '2026-09-10T09:00:00.000Z' },
  ]
  const assignments = [
    ...['mock-company-1', 'mock-company-2', 'mock-company-4', 'mock-company-9'].map((organizationId) => ({ userId: VIEWING_ADMIN_ID, organizationId })),
    { userId: 'mock-admin-lamin', organizationId: 'mock-company-3' },
  ]
  return { viewerRole: null, supportCompanyId: null, companies, admins, assignments }
}

function readState(): MockState {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as MockState
  } catch {
    // Storage unavailable (private mode): fall through to a fresh seed.
  }
  return seedState()
}

function writeState(state: MockState) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable: the mock just won't survive a reload.
  }
}

const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

function fail(status: number, title: string, detail: string): never {
  throw new ApiError({ type: `https://recon.app/errors/${title}`, title, status, detail })
}

const viewerId = (state: MockState) => (state.viewerRole === 'owner' ? OWNER_ID : VIEWING_ADMIN_ID)

// Mirrors the backend's fail-closed rule: the owner sees everything, an admin only assigned companies.
function canAccessCompany(state: MockState, organizationId: string) {
  if (state.viewerRole === 'owner') return true
  return state.assignments.some((a) => a.userId === viewerId(state) && a.organizationId === organizationId)
}

function accessibleCompany(state: MockState, id: string) {
  const company = state.companies.find((c) => c.id === id)
  if (!company || !canAccessCompany(state, id)) fail(404, 'NotFoundError', 'Company not found')
  return company
}

function requireOwner(state: MockState) {
  if (state.viewerRole !== 'owner') fail(403, 'AuthorisationError', 'Only the platform owner can manage admins')
}

const listedAdmin = (state: MockState, id: string) => {
  const admin = state.admins.find((a) => a.id === id && a.platformRole === 'admin' && a.platformStatus !== 'removed')
  if (!admin || admin.id === viewerId(state)) fail(404, 'NotFoundError', 'Platform admin not found')
  return admin
}

// --- Session stand-ins, replaced by Better Auth additionalFields at wiring ---

export function mockPlatformSession() {
  const state = readState()
  const supportCompany = state.companies.find((c) => c.id === state.supportCompanyId) ?? null
  return { platformRole: state.viewerRole, supportCompany }
}

export function setMockViewerRole(role: PlatformRole | null) {
  writeState({ ...readState(), viewerRole: role, supportCompanyId: null })
}

// --- Companies ---

export async function listCompanies({ q, status, offset = 0, limit = 20 }: CompaniesParams): Promise<CompaniesPage> {
  await delay()
  const state = readState()
  const needle = q?.trim().toLowerCase()
  const matches = state.companies
    .filter((c) => canAccessCompany(state, c.id))
    .filter((c) => !status || c.status === status)
    .filter((c) => !needle || c.name.toLowerCase().includes(needle) || c.slug.includes(needle))
  return { items: matches.slice(offset, offset + limit), total: matches.length }
}

export async function createCompany({ name, firstAdminEmail }: CreateCompanyInput): Promise<Company> {
  await delay()
  const state = readState()
  if (state.admins.some((a) => a.email.toLowerCase() === firstAdminEmail.toLowerCase())) {
    fail(409, 'ConflictError', 'That email belongs to a platform admin')
  }
  const company: Company = {
    id: `mock-company-${Date.now()}`,
    name: name.trim(),
    slug: `co-${Date.now().toString(36)}`,
    status: 'active',
    createdAt: new Date().toISOString(),
    suspendedAt: null,
    memberCount: 0,
    reportCount: 0,
  }
  const assignments = state.viewerRole === 'admin' ? [...state.assignments, { userId: viewerId(state), organizationId: company.id }] : state.assignments
  writeState({ ...state, companies: [company, ...state.companies], assignments })
  return company
}

export async function updateCompany(id: string, name: string): Promise<Company> {
  await delay()
  const state = readState()
  const updated = { ...accessibleCompany(state, id), name: name.trim() }
  writeState({ ...state, companies: state.companies.map((c) => (c.id === id ? updated : c)) })
  return updated
}

export async function setCompanyStatus(id: string, status: Company['status']): Promise<Company> {
  await delay()
  const state = readState()
  const company = accessibleCompany(state, id)
  if (company.status === status) fail(409, 'ConflictError', `Company is already ${status}`)
  const updated: Company = { ...company, status, suspendedAt: status === 'suspended' ? new Date().toISOString() : null }
  writeState({ ...state, companies: state.companies.map((c) => (c.id === id ? updated : c)) })
  return updated
}

export async function inviteCompanyUser(id: string, { email }: InviteCompanyUserInput): Promise<void> {
  await delay()
  const state = readState()
  accessibleCompany(state, id)
  if (state.admins.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
    fail(409, 'ConflictError', 'That email belongs to a platform admin')
  }
}

export async function enterCompany(id: string): Promise<EnterCompanyResult> {
  await delay()
  const state = readState()
  const company = accessibleCompany(state, id)
  writeState({ ...state, supportCompanyId: company.id })
  return { organizationId: company.id, name: company.name }
}

export async function exitCompany(): Promise<void> {
  await delay()
  writeState({ ...readState(), supportCompanyId: null })
}

// --- Platform admins (owner only) ---

export async function listPlatformAdmins({ q, offset = 0, limit = 20 }: PlatformAdminsParams): Promise<PlatformAdminsPage> {
  await delay()
  const state = readState()
  requireOwner(state)
  const needle = q?.trim().toLowerCase()
  const matches = state.admins
    .filter((a) => a.platformStatus !== 'removed')
    .filter((a) => !needle || a.name.toLowerCase().includes(needle) || a.email.toLowerCase().includes(needle))
    .map((a) => ({
      ...a,
      platformStatus: a.platformStatus as PlatformAdmin['platformStatus'],
      companyCount: a.platformRole === 'owner' ? state.companies.length : state.assignments.filter((x) => x.userId === a.id).length,
    }))
  return { items: matches.slice(offset, offset + limit), total: matches.length }
}

export async function invitePlatformAdmin({ name, email }: InvitePlatformAdminInput): Promise<void> {
  await delay()
  const state = readState()
  requireOwner(state)
  if (state.admins.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
    fail(409, 'ConflictError', 'That email already belongs to a platform admin')
  }
  const admin: MockAdmin = {
    id: `mock-admin-${Date.now()}`,
    name: name.trim(),
    email,
    platformRole: 'admin',
    platformStatus: 'active',
    createdAt: new Date().toISOString(),
  }
  writeState({ ...state, admins: [...state.admins, admin] })
}

export async function setPlatformAdminStatus(userId: string, status: PlatformAdminStatus): Promise<void> {
  await delay()
  const state = readState()
  requireOwner(state)
  listedAdmin(state, userId)
  const assignments = status === 'removed' ? state.assignments.filter((a) => a.userId !== userId) : state.assignments
  writeState({ ...state, assignments, admins: state.admins.map((a) => (a.id === userId ? { ...a, platformStatus: status } : a)) })
}

export async function getAdminCompanies(userId: string): Promise<AdminCompanies> {
  await delay()
  const state = readState()
  requireOwner(state)
  listedAdmin(state, userId)
  return { organizationIds: state.assignments.filter((a) => a.userId === userId).map((a) => a.organizationId) }
}

export async function setAdminCompanies(userId: string, { organizationIds }: AdminCompanies): Promise<AdminCompanies> {
  await delay()
  const state = readState()
  requireOwner(state)
  listedAdmin(state, userId)
  if (organizationIds.some((id) => !state.companies.some((c) => c.id === id))) {
    fail(422, 'ValidationError', 'One or more companies do not exist')
  }
  const kept = state.assignments.filter((a) => a.userId !== userId)
  writeState({ ...state, assignments: [...kept, ...organizationIds.map((organizationId) => ({ userId, organizationId }))] })
  return { organizationIds }
}
