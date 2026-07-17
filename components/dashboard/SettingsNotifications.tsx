'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'

const toggles = [
  { key: 'email', label: 'Email Notifications', description: 'Receive updates about reconciliations and reports via email.' },
  { key: 'weeklyDigest', label: 'Weekly Digest', description: 'A summary of activity across your workspace, every Monday.' },
] as const

type ToggleKey = (typeof toggles)[number]['key']

export default function SettingsNotifications() {
  const [toggleState, setToggleState] = useState<Record<ToggleKey, boolean>>({
    email: true,
    weeklyDigest: false,
  })

  return (
    <div className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0A1121]/60 p-3">
      <h3 className="text-lg font-semibold text-white">Notification Settings</h3>
      <p className="mt-1 text-sm text-slate-400">Choose what updates you receive and how.</p>

      <div className="mt-2 space-y-4">
        {toggles.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between gap-4 border-t border-[#1B2540] pt-4 first:border-t-0 first:pt-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">{label}</p>
              <p className="mt-0.5 text-xs text-slate-400">{description}</p>
            </div>
            <Switch
              checked={toggleState[key]}
              onCheckedChange={(checked) => setToggleState((prev) => ({ ...prev, [key]: checked }))}
              className="shrink-0 data-checked:bg-emerald-500"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
