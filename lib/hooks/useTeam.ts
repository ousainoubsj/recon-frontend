import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '@/lib/axios'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage, toast, toastApiError } from '@/lib/toast'
import type { Invitation, InvitationDetails, ListTeamMembersParams, TeamMember, TeamStats, UpdateMemberInput } from '@/types/team'

export const teamKeys = {
  members: (params?: ListTeamMembersParams) => ['team', 'members', params ?? {}] as const,
  stats: ['team', 'stats'] as const,
  invitations: ['team', 'invitations'] as const,
  departments: ['team', 'departments'] as const,
}

export function useTeamMembers(params?: ListTeamMembersParams) {
  return useQuery({
    queryKey: teamKeys.members(params),
    queryFn: async () => {
      try {
        const res = await axiosInstance.get<TeamMember[]>('/team/members', {
          params: {
            limit: params?.limit,
            offset: params?.offset,
            q: params?.q,
            role: params?.role,
            status: params?.status,
            department: params?.department,
          },
        })
        return res.data
      } catch (err) {
        toastApiError(err, 'Failed to load team members')
        throw err
      }
    },
  })
}

export function useTeamStats() {
  return useQuery({
    queryKey: teamKeys.stats,
    queryFn: async () => {
      try {
        return (await axiosInstance.get<TeamStats>('/team/stats')).data
      } catch (err) {
        toastApiError(err, 'Failed to load team stats')
        throw err
      }
    },
  })
}

export function useUpdateMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMemberInput }) =>
      (await axiosInstance.patch<TeamMember>(`/team/members/${id}`, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    },
    onError: (err) => toastApiError(err, 'Failed to update member'),
  })
}

// Invitations live entirely in Better Auth's own tables — no REST mirror in
// recon-backend (routes/team.js only has /members and /stats). Wrapped in
// TanStack Query anyway for the same caching/invalidation story as
// everything else on this page, even though the queryFn calls authClient
// directly instead of our own API.
export function useInvitations() {
  return useQuery({
    queryKey: teamKeys.invitations,
    queryFn: async () => {
      const { data, error } = await authClient.organization.listInvitations()
      if (error) {
        toast.error(authErrorMessage(error, 'Failed to load invitations'))
        throw error
      }
      // authClient's generic role type defaults to Better Auth's built-in
      // admin/member/owner literals since our custom admin/analyst/viewer
      // roles are only configured server-side (auth.js) — the actual
      // values returned are our real role strings regardless.
      return (data ?? []) as unknown as Invitation[]
    },
  })
}

// Org-wide department list — Member.department itself stays a plain freeform
// VARCHAR (no FK), but the canonical list admins pick from now lives in its
// own Organization.departments column (String[], added specifically for this —
// not reused from Better Auth's own Organization.metadata field, since that's
// native to the org plugin and could collide with something Better Auth itself
// writes there later).
export function useDepartments() {
  const queryClient = useQueryClient()

  const { data: departments = [], isLoading } = useQuery({
    queryKey: teamKeys.departments,
    queryFn: async () => {
      try {
        return (await axiosInstance.get<string[]>('/team/departments')).data
      } catch (err) {
        toastApiError(err, 'Failed to load departments')
        throw err
      }
    },
  })

  const addDepartment = useMutation({
    mutationFn: async (name: string) => (await axiosInstance.post<string[]>('/team/departments', { name })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teamKeys.departments }),
    onError: (err) => toastApiError(err, 'Failed to add department'),
  })

  return { departments, isLoading, addDepartment }
}

// Invitee-facing single-invitation lookup for the accept-invite landing page.
// Requires an authenticated session server-side (Better Auth 401s otherwise),
// so `enabled` should stay false until a session exists — the page itself
// handles the signed-out state before ever reaching this query.
export function useInvitationDetails(invitationId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['invitation', invitationId],
    queryFn: async () => {
      const { data, error } = await authClient.organization.getInvitation({ query: { id: invitationId } })
      if (error) throw new Error(authErrorMessage(error, 'This invitation could not be found'))
      return data as unknown as InvitationDetails
    },
    enabled,
    retry: false,
  })
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await authClient.organization.acceptInvitation({ invitationId })
      if (error) throw new Error(authErrorMessage(error, 'Failed to accept invitation'))
    },
  })
}
