'use client'

import { useQueryClient } from '@tanstack/react-query'
import { setMockViewerRole } from '@/lib/mocks/superAdmin'
import { usePlatformSession } from '@/lib/hooks/useSuperAdmin'
import type { PlatformRole } from '@/types/superAdmin'

const OPTIONS: { value: PlatformRole | 'customer'; label: string }[] = [
  { value: 'customer', label: 'Customer (normal dashboard)' },
  { value: 'owner', label: 'Platform owner' },
  { value: 'admin', label: 'Platform admin (4 companies)' },
]

// Mock-phase only: stands in for platformRole on the session until Step 6 wires it. Deleted at wiring.
export function MockRoleSwitcher() {
  const queryClient = useQueryClient()
  const { data: platform } = usePlatformSession()

  const handleChange = (value: string) => {
    setMockViewerRole(value === 'customer' ? null : (value as PlatformRole))
    queryClient.clear()
    window.location.assign('/dashboard')
  }

  return (
    <label className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg border border-dashed border-amber-500/50 bg-[#0A1128] px-3 py-2 text-xs text-amber-200 shadow-lg">
      Mock role
      <select
        value={platform?.platformRole ?? 'customer'}
        onChange={(e) => handleChange(e.target.value)}
        className="cursor-pointer rounded border border-[#232D47] bg-[#050F20] px-2 py-1 text-xs text-white"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
