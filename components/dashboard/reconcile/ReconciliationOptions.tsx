'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import UploadRecords from '@/components/dashboard/UploadRecords'

const options = [
  {
    icon: '/icons/upload.png',
    title: 'Upload New Files',
    description: 'Upload two files and configure matching rules.',
    cta: 'Start Reconciliation',
    href: '#',
    highlighted: true,
  },
  {
    icon: '/icons/draft.png',
    title: 'Continue Draft',
    description: 'Continue an unfinished reconciliation.',
    cta: 'View Drafts',
    href: '#',
    badge: 2,
    badgeColor: 'bg-violet-500',
  },
  {
    icon: '/icons/saved.png',
    title: 'Saved Template',
    description: 'Use a template with pre-configured rules.',
    cta: 'Browse Templates',
    href: '#',
    badge: 5,
    badgeColor: 'bg-blue-500',
  },
  {
    icon: '/icons/sample.png',
    title: 'Sample Dataset',
    description: 'Try a sample reconciliation with example datasets.',
    cta: 'Try Sample',
    href: '#',
  },
]

export default function ReconciliationOptions() {
  const router = useRouter()
  const [uploadOpen, setUploadOpen] = useState(false)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {options.map(({ icon, title, description, cta, href, highlighted, badge, badgeColor }) => (
        <div
          key={title}
          className={`relative flex flex-col rounded-2xl border bg-[#0D1230]/70 p-6 ${
            highlighted ? 'border-teal-400/70 shadow-[0_0_30px_-8px_rgba(45,212,191,0.5)]' : 'border-[#232D47]'
          }`}
        >
          {badge && (
            <span
              className={`absolute top-4 right-4 flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-semibold text-white ${badgeColor}`}
            >
              {badge}
            </span>
          )}

          <div className="flex flex-1 flex-col items-center text-center">
            <Image src={icon} alt="" width={110} height={110} className="h-24 w-24" />
            <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-[#A3B2C8]">{description}</p>
          </div>

          {highlighted ? (
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="mt-6 flex cursor-pointer truncate items-center justify-between rounded-lg bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-90 active:scale-95"
            >
              {cta}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href={href}
              className="mt-6 flex items-center justify-between rounded-lg border border-[#232D47] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              {cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      ))}

      <UploadRecords
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onStart={() => router.push('/dashboard/reconciliation-process')}
      />
    </div>
  )
}
