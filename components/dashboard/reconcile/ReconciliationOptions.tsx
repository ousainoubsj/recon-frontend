'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import UploadRecords from '@/components/dashboard/UploadRecords'
import ContinueDraftDialog from '@/components/dashboard/reconcile/ContinueDraftDialog'
import SavedTemplateDialog from '@/components/dashboard/reconcile/SavedTemplateDialog'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

type OptionAction = 'upload' | 'draft' | 'template' | 'sample'

const options: {
  icon: string
  title: string
  description: string
  cta: string
  action: OptionAction
  highlighted?: boolean
  badge?: number
  badgeColor?: string
}[] = [
  {
    icon: '/icons/upload.png',
    title: 'Upload New Files',
    description: 'Upload two files and configure matching rules.',
    cta: 'Start Reconciliation',
    action: 'upload',
    highlighted: true,
  },
  {
    icon: '/icons/draft.png',
    title: 'Continue Draft',
    description: 'Continue an unfinished reconciliation.',
    cta: 'View Drafts',
    action: 'draft',
    badge: 2,
    badgeColor: 'bg-violet-500',
  },
  {
    icon: '/icons/saved.png',
    title: 'Saved Template',
    description: 'Use a template with pre-configured rules.',
    cta: 'Browse Templates',
    action: 'template',
    badge: 5,
    badgeColor: 'bg-blue-500',
  },
  {
    icon: '/icons/sample.png',
    title: 'Sample Dataset',
    description: 'Try a sample reconciliation with example datasets.',
    cta: 'Try Sample',
    action: 'sample',
  },
]

export default function ReconciliationOptions() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [draftOpen, setDraftOpen] = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('upload') === '1') {
      setUploadOpen(true)
      router.replace('/dashboard/reconcile')
    }
  }, [searchParams, router])

  const handleAction = (action: OptionAction) => {
    switch (action) {
      case 'upload':
        setUploadOpen(true)
        break
      case 'draft':
        setDraftOpen(true)
        break
      case 'template':
        setTemplateOpen(true)
        break
      case 'sample':
        router.push('/dashboard/reconciliation-process')
        break
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {options.map(({ icon, title, description, cta, action, highlighted, badge, badgeColor }) => (
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

          <TruncateTooltip
            as="button"
            type="button"
            onClick={() => handleAction(action)}
            className={`mt-6 flex cursor-pointer truncate items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 active:scale-95 ${
              highlighted
                ? 'bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 shadow-md shadow-indigo-500/20 hover:opacity-90'
                : 'border border-[#232D47] hover:bg-white/5'
            }`}
            tooltip={cta}
          >
            {cta}
            <ArrowRight className="h-4 w-4" />
          </TruncateTooltip>
        </div>
      ))}

      <UploadRecords
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onStart={() => router.push('/dashboard/reconciliation-process')}
      />

      <ContinueDraftDialog
        open={draftOpen}
        onOpenChange={setDraftOpen}
        onResume={() => {
          setDraftOpen(false)
          router.push('/dashboard/reconciliation-process')
        }}
      />

      <SavedTemplateDialog
        open={templateOpen}
        onOpenChange={setTemplateOpen}
        onSelect={() => {
          setTemplateOpen(false)
          setUploadOpen(true)
        }}
      />
    </div>
  )
}
