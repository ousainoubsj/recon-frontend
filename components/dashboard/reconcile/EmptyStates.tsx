// Shared empty-state illustrations for the reconcile wizard's data tables —
// matches the teal-gradient visual language already established by
// EmptyHistory/EmptyAuditLog (History/Audit Log tables) rather than falling
// back to plain text.

export function EmptyTransactions() {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <svg width="112" height="88" viewBox="0 0 112 88" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="emptyTransactionsGlow" x1="0" y1="0" x2="1" y2="1">
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
        <circle cx="80" cy="66" r="8" stroke="url(#emptyTransactionsGlow)" strokeWidth="2" fill="none" />
        <path d="M80 61v5l3.5 2.5" stroke="url(#emptyTransactionsGlow)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div>
        <p className="text-sm font-medium text-fg-strong">No transactions match these filters</p>
        <p className="mt-1 text-xs text-fg-muted">Try a different search term or clear the status/amount/date filters.</p>
      </div>
    </div>
  )
}

// Neutral "nothing here yet" — for lists that are simply empty (no
// templates saved, no drafts in progress), not a search-yielded-no-results
// or a genuinely good outcome.
export function EmptyNeutralState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <svg width="72" height="60" viewBox="0 0 72 60" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="emptyNeutralGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="var(--brand)" />
          </linearGradient>
        </defs>
        <rect x="8" y="14" width="30" height="38" rx="4" fill="var(--surface-active)" stroke="var(--line)" strokeWidth="1.5" />
        <rect x="14" y="22" width="18" height="2.5" rx="1.25" fill="var(--illus-1)" />
        <rect x="14" y="28" width="14" height="2.5" rx="1.25" fill="var(--illus-1)" />
        <rect x="14" y="34" width="16" height="2.5" rx="1.25" fill="var(--illus-1)" />
        <rect x="30" y="8" width="30" height="38" rx="4" fill="var(--surface-raised)" stroke="url(#emptyNeutralGlow)" strokeOpacity="0.5" strokeWidth="1.5" />
        <rect x="36" y="16" width="18" height="2.5" rx="1.25" fill="var(--brand)" fillOpacity="0.35" />
        <rect x="36" y="22" width="14" height="2.5" rx="1.25" fill="var(--illus-1)" />
        <rect x="36" y="28" width="16" height="2.5" rx="1.25" fill="var(--illus-1)" />
      </svg>
      <div>
        <p className="text-sm text-fg-strong">{title}</p>
        <p className="mt-0.5 text-xs text-fg-muted">{subtitle}</p>
      </div>
    </div>
  )
}

// Success-themed (not "empty search"), since both places this is used —
// zero break causes, zero unmatched transactions — mean the reconciliation
// went well, not that something failed to load.
export function EmptySuccessState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <svg width="72" height="60" viewBox="0 0 72 60" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="emptySuccessGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>
        <circle cx="36" cy="30" r="22" fill="var(--surface-raised)" stroke="url(#emptySuccessGlow)" strokeOpacity="0.6" strokeWidth="1.5" />
        <path d="M27 30.5l6 6 12-13" stroke="url(#emptySuccessGlow)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div>
        <p className="text-sm font-medium text-fg-strong">{title}</p>
        <p className="mt-0.5 text-xs text-fg-muted">{subtitle}</p>
      </div>
    </div>
  )
}
