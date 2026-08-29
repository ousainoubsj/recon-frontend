import Image from 'next/image'
import Link from 'next/link'
import { BoltIcon, ChartIcon, DocumentIcon, ShieldCheckIcon, ShieldIcon, ShieldLockIcon } from '@/components/icons'

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
    description: 'Encrypted in transit and at rest.',
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

// Shared shell for every unauthenticated/pre-dashboard page (sign-in/sign-up,
// accept-invite, etc.) — the marketing panel + background + trust footer stay
// identical everywhere; only the centered form/content in the middle changes.
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[1.6fr_1fr]">
      <div className="relative hidden flex-col justify-between bg-slate-950 px-10 py-12 lg:flex">
        <Image src="/images/auth-bg-improved.png" alt="" fill priority className="object-cover" />

        <div className="relative space-y-20">
          <Image src="/images/Reconcil-logo.png" alt="Reconcil" width={380} height={127} priority className="h-auto w-95 -ml-7.5" />

          <div className="">
            <h1 className="text-4xl font-bold leading-tight text-white xl:text-[2.75rem]">
              Reconcile with
              <br />
              <span className="text-emerald-400">Speed.</span> <span className="text-sky-400">Trust.</span>{' '}
              <span className="text-violet-400">Confidence.</span>
            </h1>
            <p className="mt-4 max-w-98 text-[1.08rem] text-[#DDDFE2]">
              Automate financial reconciliation, eliminate manual work and close faster with complete accuracy and
              auditability.
            </p>

            <ul className="mt-12 space-y-6">
              {features.map(({ Icon, tint, title, description }) => (
                <li key={title} className="flex items-start gap-5">
                  <span className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-lg border border-white/10 ${tint}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-white">{title}</p>
                    <p className="text-base text-[#DDDFE2]">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative flex items-center gap-4 p-6 mt-12">
          <span className="absolute left-0 top-0 h-px w-full bg-[#0194A1]/40 shadow-[0_0_8px_0_#0194A1]" />
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#0B1A39]">
            <ShieldLockIcon className="h-10 w-10" />
          </span>
          <div>
            <p className="text-[1.08rem] text-[#DDDFE2]">
              We take security seriously. Your data is encrypted in transit and at rest, and never shared outside your organization.
            </p>
            <Link href="#" className="mt-1 inline-block text-sm font-semibold text-emerald-400 hover:underline">
              Learn more about our security approach →
            </Link>
          </div>
          <span className="absolute bottom-0 left-0 h-px w-3/4 bg-[#0194A1]/40 shadow-[0_0_8px_0_#0194A1]" />
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center gap-3 px-6 py-16">
        <Image src="/images/form-bg.png" alt="" fill priority className="object-cover" />

        <div className="relative w-full max-w-xl">{children}</div>

        <div className="relative flex flex-col items-center gap-1 text-center">
          <p className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
            <ShieldCheckIcon className="h-5 w-5 text-emerald-500" />
            Secure. Private. Compliant.
          </p>
          <p className="text-sm text-slate-500">SOC 2 Ready&nbsp;&nbsp;•&nbsp;&nbsp;GDPR Compliant&nbsp;&nbsp;•&nbsp;&nbsp;Encrypted</p>
        </div>
      </div>
    </div>
  )
}
