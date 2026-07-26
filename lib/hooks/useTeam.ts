import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as teamApi from '@/lib/api/team'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage, toast, toastApiError } from '@/lib/toast'
import type { Invitation, ListTeamMembersParams, UpdateMemberInput } from '@/types/team'

function readDepartments(metadata: unknown): string[] {
  const value = (metadata as { departments?: unknown } | null | undefined)?.departments
  return Array.isArray(value) ? value.filter((d): d is string => typeof d === 'string') : []
}

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

// Org-wide department list — no backend model exists for this (Member.department
// is a plain freeform VARCHAR), so the canonical list lives in Better Auth's own
// Organization.metadata field (native column, previously unused), keyed as
// `{ departments: string[] }`. Written wholesale via authClient.organization.update,
// which auto-refreshes useActiveOrganization()'s data — no manual invalidation needed.
export function useDepartments() {
  const { data: activeOrg } = authClient.useActiveOrganization()
  const departments = readDepartments(activeOrg?.metadata)

  const addDepartment = useMutation({
    mutationFn: async (name: string) => {
      const trimmed = name.trim()
      if (!activeOrg) throw new Error('No active organization')
      if (!trimmed) throw new Error('Department name is required')
      if (departments.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
        throw new Error('That department already exists')
      }
      const { error } = await authClient.organization.update({
        data: { metadata: { ...(activeOrg.metadata ?? {}), departments: [...departments, trimmed] } },
        organizationId: activeOrg.id,
      })
      if (error) throw new Error(authErrorMessage(error, 'Failed to add department'))
      return trimmed
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to add department'),
  })

  return { departments, addDepartment }
}
