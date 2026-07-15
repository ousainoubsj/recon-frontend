'use client'

import { useState } from 'react'
import { CheckCircle2, CircleDot, Printer, X } from 'lucide-react'

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'ledger', label: 'Ledger Details' },
  { key: 'counterparty', label: 'Counterparty Details' },
] as const

type TabKey = (typeof tabs)[number]['key']

const overviewRows = [
  { label: 'Description', value: 'Refund to Customer' },
  { label: 'Transaction Type', value: 'Refund' },
  { label: 'Currency', value: 'USD' },
  { label: 'Reference', value: 'TRX-0001263' },
  { label: 'Date', value: 'Jun 28, 2026' },
]

const ledgerRows = [
  { label: 'Account Number', value: '4487-2201' },
  { label: 'Ledger Reference', value: 'LED-88231' },
  { label: 'Amount', value: '$3,100.00' },
  { label: 'Posting Date', value: 'Jun 28, 2026' },
  { label: 'Cost Center', value: 'OPS-114' },
  { label: 'Entered By', value: 'J. Sanneh' },
]

const counterpartyRows = [
  { label: 'Bank Name', value: 'Trust Bank Gambia' },
  { label: 'Statement Reference', value: 'STM-55210' },
  { label: 'Amount', value: '$3,090.00' },
  { label: 'Value Date', value: 'Jun 28, 2026' },
  { label: 'Account Number', value: '0091-4467' },
  { label: 'Narration', value: 'Refund - Order #ORD-5587' },
]

const matchAnalysis = [
  { Icon: CircleDot, color: 'text-red-400', text: 'Amount difference exceeds tolerance (±0.01)' },
  { Icon: CheckCircle2, color: 'text-emerald-400', text: 'Date is within tolerance (0 days)' },
  { Icon: CheckCircle2, color: 'text-emerald-400', text: 'Reference matched exactly' },
]

export default function TransactionExplorerSidebar() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-5">
      <div className="">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
          <button
            type="button"
            aria-label="Close"
            className="cursor-pointer rounded-lg bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-stretch border-t border-[#232D47]">
          <div className="flex-1 py-4">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-red-950/60 px-2 py-1 text-xs font-medium text-red-400">Mismatched</span>
              <span className="text-sm font-semibold text-white">TRX-0001263</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">Jun 28, 2026</p>
          </div>
          <button
            type="button"
            aria-label="Print"
            className="flex cursor-pointer items-center justify-center p-4 text-slate-400 hover:text-white"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 border-t border-b border-[#232D47]">
          <div className="py-4">
            <p className="text-xl font-bold text-emerald-400">$3,100.00</p>
            <p className="mt-1 text-xs text-slate-400">Internal Ledger</p>
          </div>
          <div className="relative py-4 text-center">
            <span className="absolute inset-y-2 left-0 w-px bg-[#232D47]" />
            <p className="text-xl font-bold text-red-400">$10.00</p>
            <p className="mt-1 text-xs text-slate-400">Difference</p>
          </div>
          <div className="relative py-4 text-end">
            <span className="absolute inset-y-2 left-0 w-px bg-[#232D47]" />
            <p className="text-xl font-bold text-sky-400">$3,090.00</p>
            <p className="mt-1 text-xs text-slate-400">Counterparty</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-6 border-b border-[#232D47]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`cursor-pointer border-b-2 pb-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="mt-4 space-y-3 rounded-xl border border-[#232D47] p-4">
          {overviewRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{row.label}</span>
              <span className="font-medium text-slate-200">{row.value}</span>
            </div>
          ))}
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Notes</span>
              <span className="text-slate-500">—</span>
            </div>
            <p className="mt-1 text-sm text-slate-300">Refund processed for order #ORD-5587</p>
          </div>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="mt-4 space-y-3 rounded-xl border border-[#232D47] p-4">
          {ledgerRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{row.label}</span>
              <span className="font-medium text-slate-200">{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'counterparty' && (
        <div className="mt-4 space-y-3 rounded-xl border border-[#232D47] p-4">
          {counterpartyRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{row.label}</span>
              <span className="font-medium text-slate-200">{row.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-xl border border-[#232D47] p-4">
        <h4 className="text-sm font-semibold text-white">Match Analysis</h4>
        <ul className="mt-3 space-y-2.5">
          {matchAnalysis.map(({ Icon, color, text }, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-slate-200">
              <Icon className={`h-4 w-4 shrink-0 ${color}`} />
              {text}
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-[#232D47] pt-3 text-xs text-slate-500">Matched on: Reference, Date</p>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-[#2E3A5C] p-4">
        <h4 className="text-sm font-semibold text-white">Recommended Action</h4>
        <p className="mt-2 text-sm text-slate-400">Review amount in counterparty file.</p>
        <p className="text-sm text-slate-400">Possible missing fee/charge of $10.00.</p>
      </div>

      <div className="mt-5 border-t border-[#232D47] pt-4">
        <button
          type="button"
          className="w-full cursor-pointer rounded-lg border border-indigo-500 py-2.5 text-sm font-medium text-indigo-400 transition-all active:scale-95 hover:bg-indigo-500/10"
        >
          Mark as Reviewed
        </button>
      </div>
    </div>
  )
}
