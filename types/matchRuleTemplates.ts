import type { RuleConfig } from './wizard'

// A saved rule-config preset is personal to the user who saved it — no
// sharing concept exists (matches recon-backend's matchRuleTemplateService).
export type MatchRuleTemplate = {
  id: string
  organizationId: string
  userId: string
  name: string
  description: string | null
  config: RuleConfig
  createdAt: string
}

export type CreateMatchRuleTemplateInput = {
  name: string
  description?: string
  config: RuleConfig
}
