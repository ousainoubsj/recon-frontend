'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Search, UserRound } from 'lucide-react'
import { Command, CommandDialog, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { useGlobalSearch } from '@/lib/hooks/useSearch'
import { useOrgFormat } from '@/lib/hooks/useOrgFormat'

const DEBOUNCE_MS = 450
const MIN_QUERY_LENGTH = 2

export default function GlobalSearch() {
  const router = useRouter()
  const { formatDate } = useOrgFormat()

  const [open, setOpen] = useState(false)
  // Server render assumes Mac; the client swaps in its real platform after hydration.
  const isMac = useSyncExternalStore(
    () => () => {},
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => true,
  )
  const [value, setValue] = useState('')
  const [debouncedValue, setDebouncedValue] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((isOpen) => !isOpen)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [value])

  const query = debouncedValue.trim()
  const { data: results, isLoading } = useGlobalSearch(query)
  const hasResults = !!results && (results.reports.length > 0 || results.members.length > 0)

  let statusMessage: string | null = null
  if (query.length < MIN_QUERY_LENGTH) statusMessage = `Type at least ${MIN_QUERY_LENGTH} characters to search.`
  else if (isLoading) statusMessage = 'Searching…'
  else if (!hasResults) statusMessage = `No results found for "${query}".`

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setValue('')
      setDebouncedValue('')
    }
  }

  const goTo = (href: string) => {
    handleOpenChange(false)
    router.push(href)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full max-w-xs cursor-pointer items-center gap-2 rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-slate-500 transition-colors duration-300 hover:border-[#1CEAEA]/50"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-left">Search reconciliations, team…</span>
        <kbd className="pointer-events-none rounded border border-[#232D47] px-1.5 font-mono text-[10px] font-medium text-slate-400">
          {isMac ? '⌘' : 'Ctrl'} K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Search"
        description="Search reconciliations and team members"
        className="border border-[#232D47] bg-[#0E182D] text-white sm:max-w-xl"
      >
        {/* Results come from the server, so cmdk's own client-side filtering would hide them. */}
        <Command shouldFilter={false} className="bg-transparent">
          <CommandInput placeholder="Search reconciliations, team…" value={value} onValueChange={setValue} />
          <CommandList>
            {statusMessage && <p className="py-6 text-center text-sm text-slate-400">{statusMessage}</p>}
            {!statusMessage && results && (
              <>
                {results.reports.length > 0 && (
                  <CommandGroup heading="Reconciliations">
                    {results.reports.map((report) => (
                      <CommandItem
                        key={report.id}
                        value={`report-${report.id}`}
                        onSelect={() => goTo(`/dashboard/reconciliation-process/${report.id}`)}
                        className="cursor-pointer"
                      >
                        <FileText className="text-indigo-400" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-slate-200">{report.name ?? 'Untitled Reconciliation'}</span>
                          <span className="block truncate text-xs text-slate-500">
                            {report.fileAName ?? 'Internal file'} ↔ {report.fileBName ?? 'Counterparty file'}
                          </span>
                        </span>
                        <span className="shrink-0 whitespace-nowrap text-xs text-slate-500">{formatDate(report.runDate)}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {results.members.length > 0 && (
                  <CommandGroup heading="Team">
                    {results.members.map((member) => (
                      <CommandItem
                        key={member.id}
                        value={`member-${member.id}`}
                        onSelect={() => goTo(`/dashboard/team?member=${member.id}`)}
                        className="cursor-pointer"
                      >
                        <UserRound className="text-emerald-400" />
                        <span className="min-w-0 flex-1 truncate text-slate-200">{member.user.name}</span>
                        <span className="shrink-0 truncate text-xs text-slate-500">{member.user.email}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
