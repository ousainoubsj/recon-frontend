'use client'

import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/lib/hooks/useSettings'
import type { NotificationPreferences } from '@/types/settings'

const toggles: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  { key: 'emailNotificationsEnabled', label: 'Email Notifications', description: 'Receive updates about reconciliations and reports via email.' },
  { key: 'weeklyDigestEnabled', label: 'Weekly Digest', description: 'Get a weekly summary of reconciliation activity.' },
]

export default function SettingsNotifications() {
  const { data: prefs, isLoading } = useNotificationPreferences()
  const updatePrefs = useUpdateNotificationPreferences()

  return (
    <div
      id="notification-settings"
      className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0A1121]/60 p-3 transition-shadow duration-500"
    >
      <h3 className="text-lg font-semibold text-white">Notification Settings</h3>
      <p className="mt-1 text-sm text-slate-400">Choose what updates you receive and how.</p>

      <div className="mt-2 space-y-2">
        {isLoading || !prefs
          ? [0, 1].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 border-t border-[#1B2540] pt-4 first:border-t-0 first:pt-0">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-6 w-11 shrink-0 rounded-full" />
              </div>
            ))
          : toggles.map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between gap-4 border-t border-[#1B2540] pt-4 first:border-t-0 first:pt-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{description}</p>
                </div>
                <Switch
                  checked={prefs[key]}
                  onCheckedChange={(checked) => updatePrefs.mutate({ [key]: checked })}
                  className="shrink-0 data-checked:bg-emerald-500"
                />
              </div>
            ))}
      </div>
    </div>
  )
}
