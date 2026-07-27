import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as matchRuleTemplatesApi from '@/lib/api/matchRuleTemplates'
import { toastApiError } from '@/lib/toast'
import type { CreateMatchRuleTemplateInput } from '@/types/matchRuleTemplates'

export const matchRuleTemplateKeys = {
  list: ['matchRuleTemplates', 'list'] as const,
}

export function useMatchRuleTemplates() {
  return useQuery({
    queryKey: matchRuleTemplateKeys.list,
    queryFn: async () => {
      try {
        return await matchRuleTemplatesApi.list()
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
    mutationFn: (input: CreateMatchRuleTemplateInput) => matchRuleTemplatesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: matchRuleTemplateKeys.list }),
    onError: (err) => toastApiError(err, 'Failed to save template'),
  })
}

export function useDeleteMatchRuleTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => matchRuleTemplatesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: matchRuleTemplateKeys.list }),
    onError: (err) => toastApiError(err, 'Failed to delete template'),
  })
}
