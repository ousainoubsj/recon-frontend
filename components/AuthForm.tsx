'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent, type SubmitEvent } from 'react'
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from '@/components/icons'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage, toast } from '@/lib/toast'

type Mode = 'signin' | 'signup' | 'forgot' | 'reset' | 'verify'

const OTP_LENGTH = 6

export default function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resetToken = searchParams.get('token')

  // A password-reset email link lands back on this same page with ?token=.
  const [mode, setMode] = useState<Mode>(resetToken ? 'reset' : 'signin')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isAppleLoading, setIsAppleLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showSigninPassword, setShowSigninPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const [forgotEmail, setForgotEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [otpVerified, setOtpVerified] = useState(false)
  const otpInputsRef = useRef<Array<HTMLInputElement | null>>([])
  const isSignin = mode === 'signin'
  const isForgot = mode === 'forgot'
  const isReset = mode === 'reset'
  const isVerify = mode === 'verify'

  const goToMode = (next: Mode) => {
    setMode(next)
    setResetSent(false)
    setResetComplete(false)
    setOtp(Array(OTP_LENGTH).fill(''))
    setOtpVerified(false)
  }

  const handleForgotSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    const { error } = await authClient.requestPasswordReset({
      email: forgotEmail,
      redirectTo: typeof window !== 'undefined' ? window.location.origin + '/' : '/',
    })
    setIsSubmitting(false)
    if (error) {
      toast.error(authErrorMessage(error, 'Failed to send reset link'))
      return
    }
    toast.success('Reset link sent — check your email')
    setResetSent(true)
  }

  const handleResetSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (!resetToken) {
      toast.error('Reset link is missing or invalid')
      return
    }
    setIsSubmitting(true)
    const { error } = await authClient.resetPassword({ newPassword, token: resetToken })
    setIsSubmitting(false)
    if (error) {
      toast.error(authErrorMessage(error, 'Failed to reset password'))
      return
    }
    toast.success('Password updated successfully')
    setResetComplete(true)
  }

  const handleAuthSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    if (mode === 'signin') {
      const { error } = await authClient.signIn.email({ email, password })
      setIsSubmitting(false)
      if (error) {
        toast.error(authErrorMessage(error, 'Failed to sign in'))
        return
      }
      toast.success('Signed in successfully')
      router.push('/dashboard')
      return
    }

    // signup
    if (password !== confirmPassword) {
      setIsSubmitting(false)
      toast.error('Passwords do not match')
      return
    }
    if (!agreedToTerms) {
      setIsSubmitting(false)
      toast.error('Please agree to the Terms of Service and Privacy Policy')
      return
    }

    const { error } = await authClient.signUp.email({ email: signupEmail, password, name })
    if (error) {
      setIsSubmitting(false)
      toast.error(authErrorMessage(error, 'Failed to create account'))
      return
    }

    // Sign-up already triggers the verification OTP send automatically
    // (requireEmailVerification: true) — no separate send call needed here.
    setIsSubmitting(false)
    toast.success('Account created — check your email for a verification code')
    goToMode('verify')
  }

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    setOtp((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < OTP_LENGTH - 1) {
      otpInputsRef.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    event.preventDefault()
    setOtp(Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? ''))
    otpInputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
  }

  const handleVerifySubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    const { error } = await authClient.emailOtp.verifyEmail({ email: signupEmail, otp: otp.join('') })
    setIsSubmitting(false)
    if (error) {
      toast.error(authErrorMessage(error, 'Invalid or expired code'))
      return
    }
    toast.success('Email verified successfully')
    setOtpVerified(true)
  }

  const handleResendOtp = async () => {
    setOtp(Array(OTP_LENGTH).fill(''))
    otpInputsRef.current[0]?.focus()
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email: signupEmail, type: 'email-verification' })
    if (error) {
      toast.error(authErrorMessage(error, 'Failed to resend code'))
      return
    }
    toast.success('A new code has been sent')
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    // Must be absolute: Better Auth's redirect happens server-side from the
    // backend's OAuth callback endpoint, so a relative path here would
    // resolve against the backend's own origin, not the frontend's.
    const { error } = await authClient.signIn.social({
      provider: 'google',
      callbackURL: `${window.location.origin}/dashboard`,
    })
    if (error) {
      setIsGoogleLoading(false)
      toast.error(authErrorMessage(error, 'Failed to sign in with Google'))
    }
  }

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true)
    const { error } = await authClient.signIn.social({
      provider: 'apple',
      callbackURL: `${window.location.origin}/dashboard`,
    })
    if (error) {
      setIsAppleLoading(false)
      toast.error(authErrorMessage(error, 'Failed to sign in with Apple'))
    }
  }

  useEffect(() => {
    if (isVerify && !otpVerified) {
      otpInputsRef.current[0]?.focus()
    }
  }, [isVerify, otpVerified])

  return (
    <div className="relative w-full max-w-xl rounded-2xl p-8">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          {isSignin && 'Welcome back'}
          {mode === 'signup' && 'Create your account'}
          {isForgot && (resetSent ? 'Check your email' : 'Forgot your password?')}
          {isReset && (resetComplete ? 'Password updated' : 'Set a new password')}
          {isVerify && (otpVerified ? 'Email verified' : 'Verify your email')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isSignin && 'Sign in to your account to continue'}
          {mode === 'signup' && 'Get started with Reconcil and simplify your reconciliation process.'}
          {isForgot &&
            (resetSent
              ? `We've sent a password reset link to ${forgotEmail || 'your email'}.`
              : "No worries! Enter your email and we'll send you a link to reset your password")}
          {isReset &&
            (resetComplete
              ? 'Your password has been updated. You can now sign in with your new password.'
              : 'Choose a new password for your account')}
          {isVerify &&
            (otpVerified
              ? 'Your email has been verified. You can now sign in to your account.'
              : `Enter the 6-digit code we sent to ${signupEmail || 'your email'}`)}
        </p>
      </div>

      {isForgot ? (
        <form className="mt-8 space-y-5" onSubmit={handleForgotSubmit}>
          {!resetSent && (
            <div>
              <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="relative">
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(event) => setForgotEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <MailIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          )}

          {!resetSent && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailIcon className="h-4 w-4" />}
              Send reset link
            </button>
          )}

          {resetSent && (
            <a
              href="https://mail.google.com/mail/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-50 active:scale-95"
            >
              <Image src="/icons/gmail.png" alt="" width={16} height={16} className="h-4 w-4" />
              Open Gmail
            </a>
          )}

          <button
            type="button"
            onClick={() => goToMode('signin')}
            className="w-full cursor-pointer text-center text-sm font-medium text-blue-600 transition-all duration-300 hover:text-blue-700 active:scale-95"
          >
            Back to sign in
          </button>
        </form>
      ) : isReset ? (
        <form className="mt-8 space-y-5" onSubmit={handleResetSubmit}>
          {!resetComplete && (
            <>
              <div>
                <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  New password
                </label>
                <div className="relative">
                  <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Create a new password"
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition-all duration-300 hover:text-slate-600 active:scale-95"
                  >
                    {showNewPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-new-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Confirm new password
                </label>
                <div className="relative">
                  <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="confirm-new-password"
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={(event) => setConfirmNewPassword(event.target.value)}
                    placeholder="Confirm your new password"
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword((v) => !v)}
                    aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition-all duration-300 hover:text-slate-600 active:scale-95"
                  >
                    {showConfirmNewPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockIcon className="h-4 w-4" />}
                Reset password
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => goToMode('signin')}
            className="w-full cursor-pointer text-center text-sm font-medium text-blue-600 transition-all duration-300 hover:text-blue-700 active:scale-95"
          >
            Back to sign in
          </button>
        </form>
      ) : isVerify ? (
        <form className="mt-8 space-y-5" onSubmit={handleVerifySubmit}>
          {!otpVerified && (
            <>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputsRef.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(event) => handleOtpChange(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    onPaste={handleOtpPaste}
                    className="h-12 w-12 rounded-lg border border-slate-200 bg-white text-center text-lg font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={otp.some((digit) => !digit) || isSubmitting}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockIcon className="h-4 w-4" />}
                Verify email
              </button>

              <a
                href="https://mail.google.com/mail/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-50 active:scale-95"
              >
                <Image src="/icons/gmail.png" alt="" width={16} height={16} className="h-4 w-4" />
                Open Gmail
              </a>

              <p className="text-center text-sm text-slate-500">
                Didn&apos;t get a code?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="cursor-pointer font-semibold text-blue-600 transition-all duration-300 hover:text-blue-700 active:scale-95"
                >
                  Resend code
                </button>
              </p>
            </>
          )}

          {otpVerified && (
            <button
              type="button"
              onClick={() => goToMode('signin')}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-95 active:scale-95"
            >
              Continue to sign in
            </button>
          )}

          {!otpVerified && (
            <button
              type="button"
              onClick={() => goToMode('signup')}
              className="w-full cursor-pointer text-center text-sm font-medium text-blue-600 transition-all duration-300 hover:text-blue-700 active:scale-95"
            >
              Back to sign up
            </button>
          )}
        </form>
      ) : (
        <>
          <form className="mt-8 space-y-5" onSubmit={handleAuthSubmit}>
            {isSignin ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Email address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@company.com"
                        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <MailIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <LockIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => goToMode('forgot')}
                    className="cursor-pointer text-sm font-medium text-blue-600 transition-all duration-300 hover:text-blue-700 active:scale-95"
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Enter your full name"
                        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="work-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Work Email
                    </label>
                    <div className="relative">
                      <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="work-email"
                        type="email"
                        value={signupEmail}
                        onChange={(event) => setSignupEmail(event.target.value)}
                        placeholder="Enter your work email"
                        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <div className="relative">
                      <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Create a strong password"
                        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition-all duration-300 hover:text-slate-600 active:scale-95"
                      >
                        {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Confirm your password"
                        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition-all duration-300 hover:text-slate-600 active:scale-95"
                      >
                        {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(event) => setAgreedToTerms(event.target.checked)}
                    className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    I agree to the{' '}
                    <Link href="#" className="font-medium text-blue-600 hover:text-blue-700">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="#" className="font-medium text-blue-600 hover:text-blue-700">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockIcon className="h-4 w-4" />}
              {isSignin ? 'Sign in' : 'Create Account'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-300" />
            <span className="text-xs text-slate-500">{isSignin ? 'or continue with' : 'or sign up with'}</span>
            <div className="h-px flex-1 bg-slate-300" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Image src="/icons/search.png" alt="" width={16} height={16} className="h-4 w-4" />
              )}
              Google
            </button>
            <button
              type="button"
              onClick={handleAppleSignIn}
              disabled={isAppleLoading}
              className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAppleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Image src="/icons/apple-logo.png" alt="" width={20} height={20} className="h-5 w-5" />
              )}
              Apple
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isSignin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => goToMode(isSignin ? 'signup' : 'signin')}
              className="cursor-pointer font-medium text-blue-600 transition-all duration-300 hover:text-blue-700 active:scale-95"
            >
              {isSignin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </>
      )}
    </div>
  )
}
