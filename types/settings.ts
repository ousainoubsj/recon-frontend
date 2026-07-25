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
}

export type UpdateReconciliationDefaultsInput = {
  defaultAmountTolerance?: number | null
  defaultDateToleranceDays?: number | null
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
