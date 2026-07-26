import { apiFetch } from './client'
import type { ListTeamMembersParams, TeamMember, TeamStats, UpdateMemberInput } from '@/types/team'

export function listMembers(params?: ListTeamMembersParams) {
  return apiFetch.get<TeamMember[]>('/team/members', {
    query: {
      limit: params?.limit,
      offset: params?.offset,
      q: params?.q,
      role: params?.role,
      status: params?.status,
      department: params?.department,
    },
  })
}

export function getStats() {
  return apiFetch.get<TeamStats>('/team/stats')
}

export function updateMember(id: string, data: UpdateMemberInput) {
  return apiFetch.patch<TeamMember>(`/team/members/${id}`, data)
}

export function getDepartments() {
  return apiFetch.get<string[]>('/team/departments')
}

export function addDepartment(name: string) {
  return apiFetch.post<string[]>('/team/departments', { name })
}
