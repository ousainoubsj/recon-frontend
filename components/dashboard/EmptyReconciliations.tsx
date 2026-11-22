import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function EmptyReconciliations() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 py-6 text-center">
      <svg width="112" height="88" viewBox="0 0 112 88" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="emptyReconGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="var(--brand)" />
          </linearGradient>
        </defs>
        <g transform="rotate(-8 30 40)">
          <rect x="12" y="14" width="36" height="48" rx="6" fill="var(--surface-active)" stroke="var(--line)" strokeWidth="1.5" />
          <rect x="19" y="24" width="22" height="3" rx="1.5" fill="var(--illus-2)" />
          <rect x="19" y="32" width="18" height="3" rx="1.5" fill="var(--illus-1)" />
          <rect x="19" y="40" width="22" height="3" rx="1.5" fill="var(--illus-1)" />
          <rect x="19" y="48" width="14" height="3" rx="1.5" fill="var(--illus-1)" />
        </g>
        <g transform="rotate(8 82 40)">
          <rect x="64" y="10" width="36" height="48" rx="6" fill="var(--surface-sunken)" stroke="var(--brand)" strokeOpacity="0.35" strokeWidth="1.5" />
          <rect x="71" y="20" width="22" height="3" rx="1.5" fill="var(--brand)" fillOpacity="0.5" />
          <rect x="71" y="28" width="18" height="3" rx="1.5" fill="var(--illus-1)" />
          <rect x="71" y="36" width="22" height="3" rx="1.5" fill="var(--illus-1)" />
          <rect x="71" y="44" width="14" height="3" rx="1.5" fill="var(--illus-1)" />
        </g>
        <circle cx="56" cy="66" r="16" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
        <path
          d="M49 66.5 L53.5 71 L63.5 61"
          stroke="url(#emptyReconGlow)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <div>
        <p className="text-sm font-medium text-fg-strong">No reconciliations yet</p>
        <p className="mt-1 text-xs text-fg-muted">Run your first reconciliation to see results here.</p>
      </div>
      <Link
        href="/dashboard/reconcile?upload=1"
        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-surface-sunken px-3 py-1.5 text-xs font-medium text-brand-text transition-all duration-300 hover:border-brand/40 active:scale-95"
      >
        <Plus className="h-3.5 w-3.5" />
        Start Reconciliation
      </Link>
    </div>
  )
}
