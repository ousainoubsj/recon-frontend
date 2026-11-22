export default function EmptyActivity() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 py-6 text-center">
      <svg width="112" height="88" viewBox="0 0 112 88" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="emptyActivityGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="var(--brand)" />
          </linearGradient>
        </defs>
        <rect x="14" y="8" width="70" height="60" rx="8" fill="var(--surface-active)" stroke="var(--line)" strokeWidth="1.5" />
        <circle cx="24" cy="22" r="4" fill="var(--illus-1)" />
        <rect x="34" y="19.5" width="40" height="3" rx="1.5" fill="var(--illus-2)" />
        <rect x="34" y="26" width="26" height="2.5" rx="1.25" fill="var(--illus-1)" />
        <circle cx="24" cy="38" r="4" fill="var(--brand)" fillOpacity="0.5" />
        <rect x="34" y="35.5" width="34" height="3" rx="1.5" fill="var(--illus-1)" />
        <rect x="34" y="42" width="22" height="2.5" rx="1.25" fill="var(--illus-1)" />
        <circle cx="24" cy="54" r="4" fill="var(--illus-1)" />
        <rect x="34" y="51.5" width="40" height="3" rx="1.5" fill="var(--illus-1)" />
        <rect x="34" y="58" width="18" height="2.5" rx="1.25" fill="var(--illus-1)" />
        <circle cx="80" cy="66" r="16" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
        <circle cx="80" cy="66" r="8" stroke="url(#emptyActivityGlow)" strokeWidth="2" fill="none" />
        <path
          d="M80 61v5l3.5 2.5"
          stroke="url(#emptyActivityGlow)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <div>
        <p className="text-sm font-medium text-fg-strong">No activity yet</p>
        <p className="mt-1 text-xs text-fg-muted">Your team&apos;s recent actions will show up here.</p>
      </div>
    </div>
  )
}
