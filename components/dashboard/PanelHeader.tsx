import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export default function PanelHeader({ title, viewAllHref }: { title: string; viewAllHref?: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex cursor-pointer items-center gap-1 rounded-lg border border-line bg-surface-sunken px-3 py-1.5 text-xs font-medium text-fg-secondary transition-colors duration-300 hover:text-foreground"
        >
          View All
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}
