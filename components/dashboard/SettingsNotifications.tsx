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
      className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0A1121]/60 p-3 transition-shadow duration-500"
    >
      <h3 className="text-lg font-semibold text-white">Notification Settings</h3>
      <p className="mt-1 text-sm text-slate-400">Choose what updates you receive and how.</p>

      <div className="mt-2 space-y-2">
        {isLoading || !prefs ? (
          [0, 1].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 border-t border-[#1B2540] pt-4 first:border-t-0 first:pt-0">
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
                <p className="text-sm font-medium text-white">Email Notifications</p>
                <p className="mt-0.5 text-xs text-slate-400">Receive updates about reconciliations and reports via email.</p>
              </div>
              <Switch
                checked={prefs.emailNotificationsEnabled}
                onCheckedChange={(checked) => updatePrefs.mutate({ emailNotificationsEnabled: checked })}
                className="shrink-0 data-checked:bg-emerald-500"
              />
            </div>

            {isAdmin && (
              <div className="flex items-center justify-between gap-4 border-t border-[#1B2540] pt-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">Weekly Digest</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Every admin gets a weekly email summarizing the organization&apos;s reconciliation activity.
                  </p>
                </div>
                <Switch
                  checked={prefs.weeklyDigestEnabled}
                  onCheckedChange={(checked) => updatePrefs.mutate({ weeklyDigestEnabled: checked })}
                  className="shrink-0 data-checked:bg-emerald-500"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
