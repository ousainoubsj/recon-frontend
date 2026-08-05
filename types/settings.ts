// Matches recon-backend's settingsService.js getOrganizationInfo select —
// name/logo are included but are Better Auth-owned fields (edited via
// authClient.organization.update), not through this REST PATCH.
export type OrganizationInfo = {
  name: string
  logo: string | null
  orgType: string | null
  country: string | null
  timezone: string | null
  dateFormat: string | null
  currency: string | null
}

export type UpdateOrganizationInfoInput = {
  orgType?: string | null
  country?: string | null
  timezone?: string | null
  dateFormat?: string | null
  currency?: string | null
}

// defaultAmountTolerance is a Prisma Decimal — serializes as a string over
// JSON (same pattern as Report.totalBreakValue/amountTolerance).
export type ReconciliationDefaults = {
  defaultAmountTolerance: string | null
  defaultDateToleranceDays: number | null
  // The org's admin-designated MatchRuleTemplate, if any — non-admin members
  // are locked to this template's config everywhere (both the saved-template
  // picker and the ad-hoc "Upload New Files" flow); null means no
  // enforcement, members edit matching rules freely.
  enforcedMatchRuleTemplateId: string | null
}

export type UpdateReconciliationDefaultsInput = {
  defaultAmountTolerance?: number | null
  defaultDateToleranceDays?: number | null
  enforcedMatchRuleTemplateId?: string | null
}

export type NotificationPreferences = {
  emailNotificationsEnabled: boolean
  weeklyDigestEnabled: boolean
}

export type UpdateNotificationPreferencesInput = Partial<NotificationPreferences>

export type OrganizationLogoPresign = {
  url: string
  publicUrl: string
}
