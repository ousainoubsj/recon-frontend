'use client'

import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Menu } from '@base-ui/react/menu'
import { Bell, ChevronDown, HelpCircle, LogOut, Search } from 'lucide-react'
import ReconciliationStepper from '@/components/dashboard/reconcile/ReconciliationStepper'
import { authClient, useSession } from '@/lib/auth-client'
import { authErrorMessage, toast } from '@/lib/toast'
import { useUnreadCount } from '@/lib/hooks/useNotifications'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const isReconciliationProcess = pathname === '/dashboard/reconciliation-process'
  const { data: session } = useSession()
  const { data: unreadCountData } = useUnreadCount()
  const unreadCount = unreadCountData?.count ?? 0

  const handleLogout = async () => {
    const { error } = await authClient.signOut()
    if (error) {
      toast.error(authErrorMessage(error, 'Failed to log out'))
      return
    }
    toast.success('Logged out successfully')
    router.push('/')
  }

  return (
    <header className="shrink-0 bg-[#050F20]">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        {isReconciliationProcess ? (
          <ReconciliationStepper />
        ) : (
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Search"
              className="w-full rounded-lg border border-[#232D47] bg-[#0A1128] py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
            />
          </div>
        )}

        <div className="flex items-center gap-5">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors duration-300 hover:text-white"
          >
            <HelpCircle className="h-4 w-4" />
            Need help?
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="relative cursor-pointer text-slate-400 transition-colors duration-300 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1CEAEA] text-[10px] font-semibold text-[#050F20]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <Menu.Root>
            <Menu.Trigger className="flex cursor-pointer items-center gap-2 outline-none">
              <Image
                src={session?.user?.image || '/ousainou.jpg'}
                alt={session?.user?.name ?? ''}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
              <span className="text-left leading-tight">
                <span className="block text-sm font-semibold text-white">{session?.user?.name ?? '...'}</span>
                <span className="block text-xs text-slate-400">Administrator</span>
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner side="bottom" align="end" sideOffset={8} className="z-50">
                <Menu.Popup className="min-w-48 rounded-lg border border-[#232D47] bg-[#0A1128] shadow-lg shadow-black/40 outline-none data-[side=bottom]:slide-in-from-top-2 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
                  <Menu.Item
                    onClick={handleLogout}
                    className="flex cursor-pointer items-center gap-1 rounded-md px-3 py-2 text-sm text-slate-200 outline-none transition-colors duration-300 data-highlighted:bg-white/5 data-highlighted:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </div>

      <div className="mx-6 border-b border-[#232D47]" />
    </header>
  )
}
