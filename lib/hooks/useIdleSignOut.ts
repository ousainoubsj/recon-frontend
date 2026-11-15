import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { toast } from '@/lib/toast'

const IDLE_LOGOUT_MS = 10 * 60 * 1000
const IDLE_WARNING_MS = 60 * 1000
const CHECK_INTERVAL_MS = 1000
const ACTIVITY_WRITE_THROTTLE_MS = 5000
const ACTIVITY_KEY = 'recon:lastActivity'
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'wheel', 'scroll', 'touchstart'] as const

// localStorage can throw (private mode, blocked storage) — idle tracking then falls back to this tab's own activity.
function readStoredActivity() {
  try {
    return Number(window.localStorage.getItem(ACTIVITY_KEY)) || 0
  } catch {
    return 0
  }
}

function writeStoredActivity(timestamp: number) {
  try {
    window.localStorage.setItem(ACTIVITY_KEY, String(timestamp))
  } catch {}
}

// Signs out after 10 minutes without interaction, warning during the last minute.
// Activity is shared across tabs via localStorage, so working in any Reconcil tab keeps all of them signed in.
export function useIdleSignOut() {
  const router = useRouter()
  const [warningSeconds, setWarningSeconds] = useState<number | null>(null)
  const isWarningRef = useRef(false)
  const lastLocalActivityRef = useRef(0)
  const lastWriteRef = useRef(0)

  const recordActivity = useCallback((force: boolean) => {
    // While the warning is up only "Stay signed in" extends the session — stray mouse movement shouldn't dismiss it.
    if (!force && isWarningRef.current) return
    const now = Date.now()
    lastLocalActivityRef.current = now
    if (force || now - lastWriteRef.current > ACTIVITY_WRITE_THROTTLE_MS) {
      lastWriteRef.current = now
      writeStoredActivity(now)
    }
  }, [])

  const signOutNow = useCallback(async (timedOut: boolean) => {
    // Redirect even on error: a timed-out tab must not stay usable (e.g. another tab already ended the session).
    await authClient.signOut()
    if (timedOut) toast.error('Session timed out due to inactivity.')
    router.replace('/')
  }, [router])

  useEffect(() => {
    let isSigningOut = false

    const check = () => {
      if (isSigningOut) return
      const idleMs = Date.now() - Math.max(lastLocalActivityRef.current, readStoredActivity())
      if (idleMs >= IDLE_LOGOUT_MS) {
        isSigningOut = true
        void signOutNow(true)
      } else if (idleMs >= IDLE_LOGOUT_MS - IDLE_WARNING_MS) {
        isWarningRef.current = true
        setWarningSeconds(Math.ceil((IDLE_LOGOUT_MS - idleMs) / 1000))
      } else if (isWarningRef.current) {
        // Another tab extended the session
        isWarningRef.current = false
        setWarningSeconds(null)
      }
    }

    const onActivity = () => recordActivity(false)
    // Returning to a tab isn't activity, but re-check at once so a tab left for 20 minutes signs out immediately.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') check()
    }

    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, onActivity, { capture: true, passive: true }))
    document.addEventListener('visibilitychange', onVisibility)
    recordActivity(true)
    const intervalId = setInterval(check, CHECK_INTERVAL_MS)

    return () => {
      clearInterval(intervalId)
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity, { capture: true }))
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [recordActivity, signOutNow])

  const extendSession = useCallback(() => {
    recordActivity(true)
    isWarningRef.current = false
    setWarningSeconds(null)
  }, [recordActivity])

  return { warningSeconds, extendSession, signOutNow: () => signOutNow(false) }
}
