import type { RuleConfig } from './wizard'

// Admin-only to create (matchRuleTemplateService.js) — an admin sees every
// template in the org; a non-admin only ever sees the org's enforced default
// (Organization.enforcedMatchRuleTemplateId), if one is set.
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
