'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { OUTLINE_BUTTON, PRIMARY_BUTTON } from '@/components/super-admin/classes'
import { useIdleSignOut } from '@/lib/hooks/useIdleSignOut'

// Mounted once in DashboardShell, only while a session exists.
export default function SessionTimeoutDialog() {
  const { warningSeconds, extendSession, signOutNow } = useIdleSignOut()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOutNow()
  }

  return (
    // Escape is a deliberate response, so any dismissal counts as "Stay signed in".
    <Dialog open={warningSeconds !== null} onOpenChange={(open) => !open && extendSession()} disablePointerDismissal>
      <DialogContent showCloseButton={false} className="border border-line bg-surface-raised p-3.5 text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-foreground">Are you still there?</DialogTitle>
          <DialogDescription className="text-sm text-fg-muted">
            You&apos;ve been inactive for a while. For your security you&apos;ll be signed out in{' '}
            <span className="font-semibold tabular-nums text-foreground">{warningSeconds ?? 0}s</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-1 flex items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={handleSignOut} disabled={isSigningOut} className={OUTLINE_BUTTON}>
            {isSigningOut && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign out now
          </Button>
          <Button type="button" autoFocus onClick={extendSession} disabled={isSigningOut} className={PRIMARY_BUTTON}>
            Stay signed in
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
