import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authClient, useSession } from '@/lib/auth-client'
import { axiosInstance } from '@/lib/axios'
import { toast, toastApiError } from '@/lib/toast'
import type {
  ActiveMemberSupportFields,
  AdminCompanies,
  CompaniesPage,
  CompaniesParams,
  Company,
  CreateCompanyInput,
  EnterCompanyResult,
  InviteCompanyUserInput,
  InvitePlatformAdminInput,
  OrganizationStatus,
  PlatformAdminStatus,
  PlatformAdminsPage,
  PlatformAdminsParams,
  PlatformRole,
} from '@/types/superAdmin'

export const superAdminKeys = {
  all: ['super-admin'] as const,
  companies: (params: CompaniesParams) => ['super-admin', 'companies', params] as const,
  admins: (params: PlatformAdminsParams) => ['super-admin', 'admins', params] as const,
  adminCompanies: (userId: string) => ['super-admin', 'admin-companies', userId] as const,
}

// The viewer's platform role, and the company they're inside as platform support (if any). All three come from
// Better Auth's own session state; the active member/org only matter once we know the viewer is platform staff.
export function usePlatformSession() {
  const { data: session, isPending: isSessionPending } = useSession()
  const { data: activeMember, isPending: isMemberPending } = authClient.useActiveMember()
  const { data: activeOrganization, isPending: isOrganizationPending } = authClient.useActiveOrganization()

  const platformRole = (session?.user.platformRole ?? null) as PlatformRole | null
  // Better Auth's client types don't carry member additionalFields onto useActiveMember; the API does send it.
  const isSupportMember = !!(activeMember as ActiveMemberSupportFields | null)?.isSupport && !!activeOrganization
  const supportCompany = isSupportMember ? { id: activeOrganization.id, name: activeOrganization.name } : null
  const isLoading = isSessionPending || (!!platformRole && (isMemberPending || isOrganizationPending))

  return { data: session ? { platformRole, supportCompany } : undefined, isLoading }
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
        return (await axiosInstance.get<CompaniesPage>('/super-admin/companies', { params })).data
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
    mutationFn: async (input: CreateCompanyInput) => (await axiosInstance.post<Company>('/super-admin/companies', input)).data,
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
    mutationFn: async (name: string) => (await axiosInstance.patch<Company>(`/super-admin/companies/${id}`, { name })).data,
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
    mutationFn: async ({ id, status }: { id: string; status: OrganizationStatus }) =>
      (await axiosInstance.post<Company>(`/super-admin/companies/${id}/${status === 'suspended' ? 'suspend' : 'activate'}`)).data,
    onSuccess: (company) => {
      toast.success(company.status === 'suspended' ? `${company.name} suspended` : `${company.name} activated`)
      queryClient.invalidateQueries({ queryKey: superAdminKeys.all })
    },
    onError: (err) => toastApiError(err, 'Failed to change company status'),
  })
}

export function useInviteCompanyUser(id: string) {
  return useMutation({
    mutationFn: async (input: InviteCompanyUserInput) => {
      await axiosInstance.post(`/super-admin/companies/${id}/invitations`, input)
    },
    onSuccess: (_, input) => toast.success(`Invitation sent to ${input.email}`),
    onError: (err) => toastApiError(err, 'Failed to send invitation'),
  })
}

export function useEnterCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await axiosInstance.post<EnterCompanyResult>(`/super-admin/companies/${id}/enter`)).data,
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
    mutationFn: async () => {
      await axiosInstance.post('/super-admin/exit')
    },
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
        return (await axiosInstance.get<PlatformAdminsPage>('/super-admin/admins', { params })).data
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
    mutationFn: async (input: InvitePlatformAdminInput) => {
      await axiosInstance.post('/super-admin/admins', input)
    },
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

const ADMIN_STATUS_ACTIONS: Record<Exclude<PlatformAdminStatus, 'removed'>, string> = { active: 'activate', suspended: 'suspend' }

// Suspend, activate and remove differ only in the target status; remove is a DELETE.
export function useSetPlatformAdminStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: PlatformAdminStatus }) => {
      if (status === 'removed') await axiosInstance.delete(`/super-admin/admins/${userId}`)
      else await axiosInstance.post(`/super-admin/admins/${userId}/${ADMIN_STATUS_ACTIONS[status]}`)
    },
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
    queryFn: async () => {
      try {
        return (await axiosInstance.get<AdminCompanies>(`/super-admin/admins/${userId}/companies`)).data
      } catch (err) {
        toastApiError(err, 'Failed to load company access')
        throw err
      }
    },
    enabled: !!userId && enabled,
  })
}

export function useSetAdminCompanies(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: AdminCompanies) =>
      (await axiosInstance.put<AdminCompanies>(`/super-admin/admins/${userId}/companies`, input)).data,
    onSuccess: () => {
      toast.success('Company access updated')
      queryClient.invalidateQueries({ queryKey: superAdminKeys.all })
    },
    onError: (err) => toastApiError(err, 'Failed to update company access'),
  })
}
