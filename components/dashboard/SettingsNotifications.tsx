'use client'

import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/lib/hooks/useSettings'

export default function SettingsNotifications() {
  const { data: prefs, isLoading } = useNotificationPreferences()
  const updatePrefs = useUpdateNotificationPreferences()
  // Weekly Digest is org-wide/admin-only (not a per-user preference) — same
  // isAdmin pattern already used by TeamUsersTable.tsx/TeamUserDetails.tsx
  // to gate admin-only actions.
  const { data: activeMemberRole } = authClient.useActiveMemberRole()
  const isAdmin = activeMemberRole?.role === 'admin'

  return (
    <div
      id="notification-settings"
      className="min-w-0 rounded-2xl border border-line bg-surface-deep/60 p-3 transition-shadow duration-500"
    >
      <h3 className="text-lg font-semibold text-foreground">Notification Settings</h3>
      <p className="mt-1 text-sm text-fg-muted">Choose what updates you receive and how.</p>

      <div className="mt-2 space-y-2">
        {isLoading || !prefs ? (
          [0, 1].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 border-t border-line-subtle pt-4 first:border-t-0 first:pt-0">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-6 w-11 shrink-0 rounded-full" />
            </div>
          ))
        ) : (
          <>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Email Notifications</p>
                <p className="mt-0.5 text-xs text-fg-muted">Receive updates about reconciliations and reports via email.</p>
              </div>
              <Switch
                checked={prefs.emailNotificationsEnabled}
                onCheckedChange={(checked) => updatePrefs.mutate({ emailNotificationsEnabled: checked })}
                className="shrink-0 data-checked:bg-success-solid"
              />
            </div>

            {isAdmin && (
              <div className="flex items-center justify-between gap-4 border-t border-line-subtle pt-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Weekly Digest</p>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    Every admin gets a weekly email summarizing the organization&apos;s reconciliation activity.
                  </p>
                </div>
                <Switch
                  checked={prefs.weeklyDigestEnabled}
                  onCheckedChange={(checked) => updatePrefs.mutate({ weeklyDigestEnabled: checked })}
                  className="shrink-0 data-checked:bg-success-solid"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
