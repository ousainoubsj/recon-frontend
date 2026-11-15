'use client'

import { Menu } from '@base-ui/react/menu'
import { ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// StaffLedger's "Actions ▾" row menu, built on Base UI Menu like TeamUsersTable's row menu.
export function ActionsMenu({ children }: { children: React.ReactNode }) {
  return (
    <Menu.Root>
      <Menu.Trigger className="inline-flex h-7 cursor-pointer items-center gap-1 rounded px-2 text-xs text-fg-secondary outline-none hover:bg-overlay/5 hover:text-foreground">
        Actions
        <ChevronDown className="h-3.5 w-3.5" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={6} className="z-50">
          <Menu.Popup className="min-w-40 rounded-lg border border-line bg-surface p-1 shadow-lg shadow-black/40 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
            {children}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

type ActionsMenuItemProps = {
  onClick: () => void
  children: React.ReactNode
  tone?: 'default' | 'danger' | 'success'
  disabled?: boolean
  isPending?: boolean
}

const TONE_CLASSES: Record<NonNullable<ActionsMenuItemProps['tone']>, string> = {
  default: 'text-fg-strong data-highlighted:text-foreground',
  danger: 'text-danger data-highlighted:text-danger-soft',
  success: 'text-success data-highlighted:text-success-soft',
}

export function ActionsMenuItem({ onClick, children, tone = 'default', disabled, isPending }: ActionsMenuItemProps) {
  return (
    <Menu.Item
      onClick={onClick}
      disabled={disabled || isPending}
      className={cn(
        'flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-xs outline-none transition-colors data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-overlay/5',
        TONE_CLASSES[tone],
      )}
    >
      {isPending && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />}
      {children}
    </Menu.Item>
  )
}

export function ActionsMenuSeparator() {
  return <Menu.Separator className="my-1 h-px bg-line" />
}
