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
  // Bumped each time this template is selected to start a new
  // reconciliation — not gated on that reconciliation later succeeding.
  lastUsedAt: string | null
  useCount: number
}

export type CreateMatchRuleTemplateInput = {
  name: string
  description?: string
  config: RuleConfig
}
