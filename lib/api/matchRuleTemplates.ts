import { apiFetch } from './client'
import type { CreateMatchRuleTemplateInput, MatchRuleTemplate } from '@/types/matchRuleTemplates'

export function list() {
  return apiFetch.get<MatchRuleTemplate[]>('/match-rule-templates')
}

export function create(input: CreateMatchRuleTemplateInput) {
  return apiFetch.post<MatchRuleTemplate>('/match-rule-templates', input)
}

export function remove(id: string) {
  return apiFetch.del<void>(`/match-rule-templates/${id}`)
}
