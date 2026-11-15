import type { LucideIcon } from 'lucide-react'

type PlaceholderPageProps = {
  title: string
  description: string
  Icon: LucideIcon
}

export default function PlaceholderPage({ title, description, Icon }: PlaceholderPageProps) {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-line bg-surface px-10 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-info-solid/15">
          <Icon className="h-7 w-7 text-info" />
        </span>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-fg-muted">{description}</p>
      </div>
    </main>
  )
}
