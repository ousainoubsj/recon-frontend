'use client'

import { useState } from 'react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Menu } from '@base-ui/react/menu'
import { ChevronDown, HelpCircle, LogOut, UserCircle } from 'lucide-react'
import ReconciliationStepper from '@/components/dashboard/reconcile/ReconciliationStepper'
import ProfileDialog from '@/components/dashboard/ProfileDialog'
import NotificationsDropdown from '@/components/dashboard/NotificationsDropdown'
import GlobalSearch from '@/components/dashboard/GlobalSearch'
import HelpDialog from '@/components/dashboard/HelpDialog'
import { authClient, useSession } from '@/lib/auth-client'
import { authErrorMessage, toast } from '@/lib/toast'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const isReconciliationProcess = pathname.startsWith('/dashboard/reconciliation-process')
  const { data: session } = useSession()
  const [profileOpen, setProfileOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

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
        {isReconciliationProcess ? <ReconciliationStepper /> : <GlobalSearch />}

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors duration-300 hover:text-white"
          >
            <HelpCircle className="h-4 w-4" />
            Need help?
          </button>

          <NotificationsDropdown />

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
                <Menu.Popup className="min-w-52 space-y-2! rounded-lg border border-[#232D47] bg-[#0A1128] shadow-lg shadow-black/40 outline-none data-[side=bottom]:slide-in-from-top-2 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 p-1.5">
                  <Menu.Item
                    onClick={() => setProfileOpen(true)}
                    className="flex hover:bg-emerald-600! hover:text-slate-100 cursor-pointer items-center gap-1 rounded-md px-3 py-2 text-sm text-emerald-400 outline-none transition-all duration-300 data-highlighted:bg-white/5 data-highlighted:text-white"
                  >
                    <UserCircle className="h-4 w-4" />
                    Profile
                  </Menu.Item>
                  <Menu.Item
                    onClick={handleLogout}
                    className="flex bg-rose-600! hover:bg-rose-600/80!  cursor-pointer items-center gap-1 rounded-md px-3 py-2 text-sm outline-none transition-all duration-300 data-highlighted:bg-white/5 data-highlighted:text-white"
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

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </header>
  )
}
