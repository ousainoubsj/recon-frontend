import { ClipboardCheck, Diamond, Info, Lock, Save, ShieldCheck, ShieldQuestion } from 'lucide-react'

const tips = [
  {
    Icon: ClipboardCheck,
    title: 'Prepare your files',
    description: 'Ensure both files have a common reference and amount columns.',
  },
  {
    Icon: ShieldCheck,
    title: 'Check your rules',
    description: 'Set appropriate tolerances for amount and date to reduce false breaks.',
  },
  {
    Icon: Save,
    title: 'Save as template',
    description: 'Save your configuration as a template to save time next month.',
  },
  {
    Icon: ShieldQuestion,
    title: 'Need help?',
    description: 'Visit our help center or contact support for assistance. Find email address on the sidebar',
  },
]

export default function ReconciliationTips() {
  return (
    <aside className="flex h-62 w-full flex-col lg:w-64 lg:shrink-0">
      <div className="flex flex-col rounded-2xl border border-line bg-surface-inset/50 p-4">
        <div className="mb-5 flex items-center gap-2">
          <Info className="h-4 w-4 text-accent-indigo-soft" />
          <h3 className="text-base font-semibold text-foreground">Reconciliation Tips</h3>
        </div>

        <ul className="space-y-4">
          {tips.map(({ Icon, title, description }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-300">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-fg-muted">{description}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="rounded-xl mt-52 border border-indigo-400/40 bg-surface-inset p-4 shadow-[0_0_30px_-10px_rgba(99,102,241,0.55)]">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-active text-fg-secondary">
              <Lock className="h-4 w-4" />
            </span>
            <Diamond className="h-3 w-3 fill-indigo-400 text-accent-indigo" />
          </div>
          <p className="text-sm font-semibold text-foreground">Enterprise Grade Security</p>
          <p className="mt-1 text-xs leading-relaxed text-fg-muted">
            Your files are encrypted in transit and at rest, and only accessible within your organization.
          </p>
        </div>
      </div>
    </aside>
  )
}
