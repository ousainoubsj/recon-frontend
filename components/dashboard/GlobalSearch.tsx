'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Search, UserRound } from 'lucide-react'
import { useGlobalSearch } from '@/lib/hooks/useSearch'
import { useOrgFormat } from '@/lib/hooks/useOrgFormat'

const DEBOUNCE_MS = 450

export default function GlobalSearch() {
  const router = useRouter()
  const { formatDate } = useOrgFormat()
  const containerRef = useRef<HTMLDivElement>(null)

  const [value, setValue] = useState('')
  const [debouncedValue, setDebouncedValue] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [value])

  // Closes the panel on an outside click — there's no click-based trigger to
  // hand this off to (unlike NotificationsDropdown's Popover), since the
  // panel opens from typing/focusing a plain text input instead.
  useEffect(() => {
    if (!open) return
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  const query = debouncedValue.trim()
  const { data: results, isLoading } = useGlobalSearch(query)
  const showPanel = open && query.length >= 2
  const hasResults = !!results && (results.reports.length > 0 || results.members.length > 0)

  const close = () => {
    setOpen(false)
    setValue('')
    setDebouncedValue('')
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        type="search"
        placeholder="Search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className="w-full rounded-lg border border-[#232D47] bg-[#0A1128] py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
      />

      {showPanel && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 max-w-[90vw] rounded-xl border border-[#232D47] bg-[#0A1128] p-2 text-sm shadow-lg shadow-black/40">
          {isLoading ? (
            <p className="px-2 py-3 text-slate-400">Searching…</p>
          ) : !hasResults ? (
            <p className="px-2 py-3 text-slate-400">No results found for &quot;{query}&quot;.</p>
          ) : (
            <>
              {results.reports.length > 0 && (
                <div className="mb-1">
                  <p className="px-2 py-1 text-xs font-medium text-slate-500">Reconciliations</p>
                  {results.reports.map((report) => (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => {
                        close()
                        router.push(`/dashboard/reconciliation-process/${report.id}`)
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left transition-all duration-300 hover:bg-white/5 active:scale-[0.99]"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-indigo-400" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-slate-200">{report.name ?? 'Untitled Reconciliation'}</span>
                        <span className="block truncate text-xs text-slate-500">
                          {report.fileAName ?? 'Internal file'} ↔ {report.fileBName ?? 'Counterparty file'}
                        </span>
                      </span>
                      <span className="shrink-0 whitespace-nowrap text-xs text-slate-500">{formatDate(report.runDate)}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.members.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-xs font-medium text-slate-500">Team</p>
                  {results.members.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        close()
                        router.push(`/dashboard/team?member=${member.id}`)
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left transition-all duration-300 hover:bg-white/5 active:scale-[0.99]"
                    >
                      <UserRound className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span className="min-w-0 flex-1 truncate text-slate-200">{member.user.name}</span>
                      <span className="shrink-0 truncate text-xs text-slate-500">{member.user.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
