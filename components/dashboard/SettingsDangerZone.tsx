import { Trash2 } from 'lucide-react'

export default function SettingsDangerZone() {
  return (
    <div className="rounded-2xl border border-rose-500/30 bg-[#0A1121]/40 p-3">
      <h3 className="text-lg font-semibold text-rose-400">Danger Zone</h3>

      <p className="mt-1 text-sm text-slate-400">Reset all settings to default.</p>
      <button
        type="button"
        className="mt-2 w-full cursor-pointer rounded-lg border border-rose-500/50 py-2.5 text-sm font-medium text-rose-400 transition-all hover:bg-rose-500/10 active:scale-95"
      >
        Reset to Default
      </button>
      <p className="mt-2 text-xs text-slate-500">This action cannot be undone.</p>

      <button
        type="button"
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-rose-500/50 py-2.5 text-sm font-medium text-rose-400 transition-all hover:bg-rose-500/10 active:scale-95"
      >
        <Trash2 className="h-4 w-4" />
        Delete Account
      </button>
      <p className="mt-2 text-xs text-slate-500">Permanently delete your account.</p>
    </div>
  )
}
