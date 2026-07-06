'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent, type SubmitEvent } from 'react'
import { BuildingIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from '@/components/icons'

type Mode = 'signin' | 'signup' | 'forgot' | 'reset' | 'verify'

const OTP_LENGTH = 6

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

  const handleForgotSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResetSent(true)
  }

  const handleResetSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResetComplete(true)
  }

  const handleAuthSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mode === 'signup') {
      goToMode('verify')
    }
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

  const handleVerifySubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setOtpVerified(true)
  }

  const handleResendOtp = () => {
    setOtp(Array(OTP_LENGTH).fill(''))
    otpInputsRef.current[0]?.focus()
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
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-95 active:scale-95"
            >
              <MailIcon className="h-4 w-4" />
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
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-95 active:scale-95"
              >
                <LockIcon className="h-4 w-4" />
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
                disabled={otp.some((digit) => !digit)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LockIcon className="h-4 w-4" />
                Verify email
              </button>

              <a
                href="https://mail.google.com/mail/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-50 active:scale-95"
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

                <div>
                  <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Company Name
                  </label>
                  <div className="relative">
                    <BuildingIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="company"
                      type="text"
                      placeholder="Enter your company name"
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
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
                    className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    I agree to the{' '}
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </>
            )}

            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-95 active:scale-95"
            >
              <LockIcon className="h-4 w-4" />
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
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-50 active:scale-95"
            >
              <Image src="/icons/search.png" alt="" width={16} height={16} className="h-4 w-4" />
              Google
            </button>
            <button
              type="button"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-50 active:scale-95"
            >
              <Image src="/icons/apple-logo.png" alt="" width={20} height={20} className="h-5 w-5" />
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
