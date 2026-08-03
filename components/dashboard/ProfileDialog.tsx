'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage, toast } from '@/lib/toast'

type ProfileDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const INPUT_CLASSNAME =
  'w-full rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]'

// Each section (Name/Email/Password) submits independently — one failing
// field (e.g. wrong current password) shouldn't block an unrelated name
// change, and each has its own pending/error state rather than one combined
// submit for the whole dialog.
export default function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { data: session } = authClient.useSession()

  const [name, setName] = useState('')
  const [isSavingName, setIsSavingName] = useState(false)

  const [email, setEmail] = useState('')
  const [isSavingEmail, setIsSavingEmail] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // Resets the form from the fresh session the moment `open` flips to true —
  // an in-render state adjustment (React's documented alternative to
  // useEffect+setState for "sync state when a prop changes"), not a passive
  // effect, since Header controls `open` directly rather than through this
  // dialog's own onOpenChange.
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open && session?.user) {
      setName(session.user.name ?? '')
      setEmail(session.user.email ?? '')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const handleSaveName = async () => {
    const trimmed = name.trim()
    if (!trimmed || trimmed === session?.user?.name) return
    setIsSavingName(true)
    const { error } = await authClient.updateUser({ name: trimmed })
    setIsSavingName(false)
    if (error) {
      toast.error(authErrorMessage(error, 'Failed to update name'))
      return
    }
    toast.success('Name updated')
  }

  const handleSaveEmail = async () => {
    const trimmed = email.trim()
    if (!trimmed || trimmed === session?.user?.email) return
    setIsSavingEmail(true)
    const { error } = await authClient.changeEmail({ newEmail: trimmed })
    setIsSavingEmail(false)
    if (error) {
      toast.error(authErrorMessage(error, 'Failed to update email'))
      return
    }
    toast.success('Verification email sent to confirm the change')
  }

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword) return
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match')
      return
    }
    setIsSavingPassword(true)
    const { error } = await authClient.changePassword({ currentPassword, newPassword })
    setIsSavingPassword(false)
    if (error) {
      toast.error(authErrorMessage(error, 'Failed to update password'))
      return
    }
    toast.success('Password updated')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-[#232D47] bg-[#0E182D] p-3.5 text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-white">Profile</DialogTitle>
          <DialogDescription className="text-sm text-slate-400">Manage your name, email, and password.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Name</label>
            <div className="flex items-center gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLASSNAME} />
              <Button
                type="button"
                onClick={handleSaveName}
                disabled={isSavingName || !name.trim() || name.trim() === session?.user?.name}
                className="cursor-pointer bg-indigo-500 px-4 text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingName && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Email</label>
            <div className="flex items-center gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT_CLASSNAME} />
              <Button
                type="button"
                onClick={handleSaveEmail}
                disabled={isSavingEmail || !email.trim() || email.trim() === session?.user?.email}
                className="cursor-pointer bg-indigo-500 px-4 text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingEmail && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </div>

          <div className="space-y-2 border-t border-[#232D47] pt-4">
            <label className="text-xs font-medium text-slate-400">Change Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className={INPUT_CLASSNAME}
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className={INPUT_CLASSNAME}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={INPUT_CLASSNAME}
            />
            <Button
              type="button"
              onClick={handleSavePassword}
              disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="flex w-full cursor-pointer items-center justify-center gap-2 bg-indigo-500 text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSavingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
