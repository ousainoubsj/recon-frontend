export const teamTabs = ['Users', 'Invitations'] as const

export type TeamTab = (typeof teamTabs)[number]

type TeamTabsProps = {
  activeTab: TeamTab
  onTabChange: (tab: TeamTab) => void
}

export default function TeamTabs({ activeTab, onTabChange }: TeamTabsProps) {
  return (
    <div className="flex items-center gap-6 border-b border-line">
      {teamTabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={`relative cursor-pointer pb-3 text-sm font-medium transition-colors ${
            activeTab === tab ? 'text-accent-indigo' : 'text-fg-muted hover:text-fg-strong'
          }`}
        >
          {tab}
          {activeTab === tab && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent-indigo-solid" />}
        </button>
      ))}
    </div>
  )
}
