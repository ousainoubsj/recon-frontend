import { ChevronDown } from 'lucide-react'

const selects: { label: string; value: string }[] = [
  { label: 'Organization Type', value: 'Financial Services' },
  { label: 'Country', value: 'United Kingdom' },
  { label: 'Timezone', value: '(GMT+01:00) London' },
  { label: 'Date Format', value: 'DD MMM YYYY (30 Jun 2026)' },
  { label: 'Currency', value: 'GBP - British Pound (£)' },
]

export default function SettingsOrganizationInfo() {
  return (
    <div className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0A1121]/60 p-3">
      <h3 className="text-lg font-semibold text-white">Organization Information</h3>

      <div className="mt-2 space-y-4">
        <div>
          <label className="mb-2 block text-sm text-slate-400">Organization Name</label>
          <input
            type="text"
            defaultValue="ReconcilePro Ltd."
            className="w-full rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-white focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
          />
        </div>

        {selects.map(({ label, value }) => (
          <div key={label}>
            <label className="mb-2 block text-sm text-slate-400">{label}</label>
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-left text-sm text-white hover:bg-white/5"
            >
              {value}
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
