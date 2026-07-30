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
            <stop offset="100%" stopColor="#1CEAEA" />
          </linearGradient>
        </defs>
        <rect x="14" y="8" width="70" height="60" rx="8" fill="#111A33" stroke="#232D47" strokeWidth="1.5" />
        <circle cx="24" cy="22" r="4" fill="#2C3654" />
        <rect x="34" y="19.5" width="40" height="3" rx="1.5" fill="#3A4568" />
        <rect x="34" y="26" width="26" height="2.5" rx="1.25" fill="#2C3654" />
        <circle cx="24" cy="38" r="4" fill="#1CEAEA" fillOpacity="0.5" />
        <rect x="34" y="35.5" width="34" height="3" rx="1.5" fill="#2C3654" />
        <rect x="34" y="42" width="22" height="2.5" rx="1.25" fill="#2C3654" />
        <circle cx="24" cy="54" r="4" fill="#2C3654" />
        <rect x="34" y="51.5" width="40" height="3" rx="1.5" fill="#2C3654" />
        <rect x="34" y="58" width="18" height="2.5" rx="1.25" fill="#2C3654" />
        <circle cx="80" cy="66" r="16" fill="#0A1128" stroke="#232D47" strokeWidth="1.5" />
        <circle cx="80" cy="66" r="8" stroke="url(#emptyTransactionsGlow)" strokeWidth="2" fill="none" />
        <path d="M80 61v5l3.5 2.5" stroke="url(#emptyTransactionsGlow)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div>
        <p className="text-sm font-medium text-slate-200">No transactions match these filters</p>
        <p className="mt-1 text-xs text-slate-400">Try a different search term or clear the status/amount/date filters.</p>
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
        <circle cx="36" cy="30" r="22" fill="#0F1830" stroke="url(#emptySuccessGlow)" strokeOpacity="0.6" strokeWidth="1.5" />
        <path d="M27 30.5l6 6 12-13" stroke="url(#emptySuccessGlow)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div>
        <p className="text-sm font-medium text-slate-200">{title}</p>
        <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
  )
}
