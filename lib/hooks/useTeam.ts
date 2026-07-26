import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as teamApi from '@/lib/api/team'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage, toast, toastApiError } from '@/lib/toast'
import type { Invitation, ListTeamMembersParams, UpdateMemberInput } from '@/types/team'

export const teamKeys = {
  members: (params?: ListTeamMembersParams) => ['team', 'members', params ?? {}] as const,
  stats: ['team', 'stats'] as const,
  invitations: ['team', 'invitations'] as const,
}

export function useTeamMembers(params?: ListTeamMembersParams) {
  return useQuery({
    queryKey: teamKeys.members(params),
    queryFn: async () => {
      try {
        return await teamApi.listMembers(params)
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
        return await teamApi.getStats()
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
    mutationFn: ({ id, data }: { id: string; data: UpdateMemberInput }) => teamApi.updateMember(id, data),
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
