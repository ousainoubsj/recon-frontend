import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast, toastApiError } from '@/lib/toast'
import * as mock from '@/lib/mocks/superAdmin'
import type {
  AdminCompanies,
  CompaniesParams,
  CreateCompanyInput,
  InviteCompanyUserInput,
  InvitePlatformAdminInput,
  OrganizationStatus,
  PlatformAdminStatus,
  PlatformAdminsParams,
} from '@/types/superAdmin'

export const superAdminKeys = {
  all: ['super-admin'] as const,
  session: ['super-admin', 'session'] as const,
  companies: (params: CompaniesParams) => ['super-admin', 'companies', params] as const,
  admins: (params: PlatformAdminsParams) => ['super-admin', 'admins', params] as const,
  adminCompanies: (userId: string) => ['super-admin', 'admin-companies', userId] as const,
}

// The viewer's platform role and the company they're inside, if any. Comes from Better Auth's session user
// (platformRole) and active member (isSupport) once wired.
export function usePlatformSession() {
  return useQuery({
    queryKey: superAdminKeys.session,
    queryFn: async () => mock.mockPlatformSession(),
    staleTime: Infinity,
  })
}

// Entering or leaving a company swaps the whole org context, so the page reloads rather than navigating.
function reloadInto(path: string) {
  window.location.assign(path)
}

export function useCompanies(params: CompaniesParams) {
  return useQuery({
    queryKey: superAdminKeys.companies(params),
    queryFn: async () => {
      try {
        return await mock.listCompanies(params)
      } catch (err) {
        toastApiError(err, 'Failed to load companies')
        throw err
      }
    },
    placeholderData: (previous) => previous,
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCompanyInput) => mock.createCompany(input),
    onSuccess: (company) => {
      toast.success(`${company.name} created — invitation sent`)
      queryClient.invalidateQueries({ queryKey: superAdminKeys.all })
    },
    onError: (err) => toastApiError(err, 'Failed to create company'),
  })
}

export function useUpdateCompany(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => mock.updateCompany(id, name),
    onSuccess: () => {
      toast.success('Company renamed')
      queryClient.invalidateQueries({ queryKey: superAdminKeys.all })
    },
    onError: (err) => toastApiError(err, 'Failed to rename company'),
  })
}

export function useSetCompanyStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrganizationStatus }) => mock.setCompanyStatus(id, status),
    onSuccess: (company) => {
      toast.success(company.status === 'suspended' ? `${company.name} suspended` : `${company.name} activated`)
      queryClient.invalidateQueries({ queryKey: superAdminKeys.all })
    },
    onError: (err) => toastApiError(err, 'Failed to change company status'),
  })
}

export function useInviteCompanyUser(id: string) {
  return useMutation({
    mutationFn: (input: InviteCompanyUserInput) => mock.inviteCompanyUser(id, input),
    onSuccess: (_, input) => toast.success(`Invitation sent to ${input.email}`),
    onError: (err) => toastApiError(err, 'Failed to send invitation'),
  })
}

export function useEnterCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mock.enterCompany(id),
    onSuccess: () => {
      queryClient.clear()
      reloadInto('/dashboard')
    },
    onError: (err) => toastApiError(err, 'Failed to enter company'),
  })
}

export function useExitCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => mock.exitCompany(),
    onSuccess: () => {
      queryClient.clear()
      reloadInto('/dashboard')
    },
    onError: (err) => toastApiError(err, 'Failed to exit company'),
  })
}

// Only rendered for the owner (PlatformHome hides the tab otherwise); an admin would get a 403.
export function usePlatformAdmins(params: PlatformAdminsParams) {
  return useQuery({
    queryKey: superAdminKeys.admins(params),
    queryFn: async () => {
      try {
        return await mock.listPlatformAdmins(params)
      } catch (err) {
        toastApiError(err, 'Failed to load platform admins')
        throw err
      }
    },
    placeholderData: (previous) => previous,
  })
}

export function useInvitePlatformAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: InvitePlatformAdminInput) => mock.invitePlatformAdmin(input),
    onSuccess: (_, input) => {
      toast.success(`Invitation sent to ${input.email}`)
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'admins'] })
    },
    onError: (err) => toastApiError(err, 'Failed to invite admin'),
  })
}

const ADMIN_STATUS_TOAST: Record<PlatformAdminStatus, string> = {
  active: 'Admin activated',
  suspended: 'Admin suspended',
  removed: 'Admin removed',
}

// Suspend, activate and remove differ only in the target status; remove is DELETE once wired.
export function useSetPlatformAdminStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: PlatformAdminStatus }) =>
      mock.setPlatformAdminStatus(userId, status),
    onSuccess: (_, { status }) => {
      toast.success(ADMIN_STATUS_TOAST[status])
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'admins'] })
    },
    onError: (err) => toastApiError(err, 'Failed to update admin'),
  })
}

export function useAdminCompanies(userId: string, enabled: boolean) {
  return useQuery({
    queryKey: superAdminKeys.adminCompanies(userId),
    queryFn: () => mock.getAdminCompanies(userId),
    enabled: !!userId && enabled,
  })
}

export function useSetAdminCompanies(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AdminCompanies) => mock.setAdminCompanies(userId, input),
    onSuccess: () => {
      toast.success('Company access updated')
      queryClient.invalidateQueries({ queryKey: superAdminKeys.all })
    },
    onError: (err) => toastApiError(err, 'Failed to update company access'),
  })
}
