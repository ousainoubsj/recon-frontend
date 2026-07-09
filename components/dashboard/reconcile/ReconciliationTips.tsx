import { ClipboardCheck, Gem, LifeBuoy, Lock, Sparkles, Timer } from 'lucide-react'

const tips = [
  {
    Icon: ClipboardCheck,
    title: 'Prepare your files',
    description: 'Ensure both files have a common reference and amount columns.',
  },
  {
    Icon: Timer,
    title: 'Check your rules',
    description: 'Set appropriate tolerances for amount and date to reduce false breaks.',
  },
  {
    Icon: Sparkles,
    title: 'Save as template',
    description: 'Save your configuration as a template to save time next month.',
  },
  {
    Icon: LifeBuoy,
    title: 'Need help?',
    description: 'Visit our help center or contact support for assistance.',
  },
]

export default function ReconciliationTips() {
  return (
    <aside className="flex w-full flex-col gap-4 lg:w-64 lg:shrink-0">
      <div className="rounded-2xl border border-[#232D47] bg-[#0E182D] p-4">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-sky-400" />
          <h3 className="text-base font-semibold text-white">Reconciliation Tips</h3>
        </div>

        <ul className="space-y-5">
          {tips.map(({ Icon, title, description }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-indigo-500/40 bg-[#0E182D] p-4 shadow-[0_0_24px_-8px_rgba(99,102,241,0.5)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111C3D] text-slate-300">
            <Lock className="h-3.5 w-3.5" />
          </span>
          <Gem className="h-4 w-4 text-indigo-400" />
        </div>
        <p className="text-sm font-semibold text-white">Enterprise Grade Security</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Your data is processed in your browser and never leaves your device.
        </p>
      </div>
    </aside>
  )
}
