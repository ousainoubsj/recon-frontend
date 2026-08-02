import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '@/lib/axios'
import { toastApiError } from '@/lib/toast'
import type { CreateMatchRuleTemplateInput, MatchRuleTemplate } from '@/types/matchRuleTemplates'

export const matchRuleTemplateKeys = {
  list: ['matchRuleTemplates', 'list'] as const,
}

export function useMatchRuleTemplates() {
  return useQuery({
    queryKey: matchRuleTemplateKeys.list,
    queryFn: async () => {
      try {
        return (await axiosInstance.get<MatchRuleTemplate[]>('/match-rule-templates')).data
      } catch (err) {
        toastApiError(err, 'Failed to load saved templates')
        throw err
      }
    },
  })
}

export function useCreateMatchRuleTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateMatchRuleTemplateInput) =>
      (await axiosInstance.post<MatchRuleTemplate>('/match-rule-templates', input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: matchRuleTemplateKeys.list }),
    onError: (err) => toastApiError(err, 'Failed to save template'),
  })
}

export function useDeleteMatchRuleTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => axiosInstance.delete<void>(`/match-rule-templates/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: matchRuleTemplateKeys.list }),
    onError: (err) => toastApiError(err, 'Failed to delete template'),
  })
}

export function useRecordTemplateUsage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => axiosInstance.post<void>(`/match-rule-templates/${id}/use`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: matchRuleTemplateKeys.list }),
    // No toast — this is a best-effort side effect of selecting a template,
    // not something a failure should interrupt the user over.
  })
}
