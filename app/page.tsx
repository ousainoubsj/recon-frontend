import Image from 'next/image'
import AuthForm from '@/components/AuthForm'
import ThemeToggle from '@/components/ThemeToggle'
import { BoltIcon, ChartIcon, DocumentIcon, LockIcon, ShieldCheckIcon, ShieldIcon } from '@/components/icons'

const features = [
  {
    Icon: BoltIcon,
    tint: 'bg-emerald-400/10 text-emerald-400',
    title: 'Lightning Fast',
    description: 'Reconcile 100k transactions in < 3 seconds',
  },
  {
    Icon: ShieldIcon,
    tint: 'bg-sky-400/10 text-sky-400',
    title: 'Data Secure',
    description: 'Your data stays private. Always.',
  },
  {
    Icon: ChartIcon,
    tint: 'bg-violet-400/10 text-violet-400',
    title: 'Full Visibility',
    description: 'Real-time insights and detailed reporting',
  },
  {
    Icon: DocumentIcon,
    tint: 'bg-emerald-400/10 text-emerald-400',
    title: 'Audit Ready',
    description: 'Complete audit trail for every reconciliation',
  },
]

export default function Page() {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[1.4fr_1fr]">
      <div
        className="relative hidden flex-col justify-between bg-slate-950 bg-cover bg-center px-10 py-12 lg:flex xl:px-16 xl:py-14"
        style={{ backgroundImage: "url('/images/auth-bg-2.png')" }}
      >
        <Image src="/images/Reconcil-logo.png" alt="Reconcil" width={200} height={67} priority className="h-auto w-47.5" />

        <div className="max-w-md">
          <h1 className="text-4xl font-bold leading-tight text-white xl:text-[2.75rem]">
            Reconcile with
            <br />
            <span className="text-emerald-400">Speed.</span> <span className="text-sky-400">Trust.</span>{' '}
            <span className="text-violet-400">Confidence.</span>
          </h1>
          <p className="mt-4 text-slate-300/90">
            Automate financial reconciliation, eliminate manual work and close faster with complete accuracy and
            auditability.
          </p>

          <ul className="mt-8 space-y-5">
            {features.map(({ Icon, tint, title, description }) => (
              <li key={title} className="flex items-start gap-4">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 ${tint}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="text-sm text-slate-400">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-start gap-3 border-t border-white/10 pt-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10">
            <LockIcon className="h-5 w-5 text-emerald-400" />
          </span>
          <p className="max-w-sm text-sm text-slate-300">
            We take security seriously. Your transaction data is never stored on our servers.{' '}
            <a href="#" className="font-medium text-emerald-400 hover:underline">
              Learn more about our security approach →
            </a>
          </p>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center gap-8 bg-linear-to-br from-white via-slate-50 to-indigo-50 px-6 py-16">
        <div className="absolute right-6 top-6">
          <ThemeToggle />
        </div>

        <AuthForm />

        <div className="flex flex-col items-center gap-1 text-center">
          <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
            Secure. Private. Compliant.
          </p>
          <p className="text-xs text-slate-400">SOC 2 Ready&nbsp;&nbsp;•&nbsp;&nbsp;GDPR Compliant&nbsp;&nbsp;•&nbsp;&nbsp;Encrypted</p>
        </div>
      </div>
    </div>
  )
}
