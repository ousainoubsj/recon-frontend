import Image from 'next/image'
import { LockIcon, MailIcon } from '@/components/icons'

export default function AuthForm() {
  return (
    <div className="relative w-full max-w-md rounded-2xl bg-[#FEFEFE] p-8 pt-12 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/5">
      <div className="absolute left-1/2 top-0 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-[#FEFEFE] shadow-md ring-1 ring-slate-100">
        <Image src="/images/logo-sym.png" alt="Reconcil" width={64} height={64} className="h-16 w-16 object-cover" />
      </div>

      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to your account to continue</p>
      </div>

      <form className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-4 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-4 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <LockIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="flex justify-end">
          <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-95 active:scale-95"
        >
          <LockIcon className="h-4 w-4" />
          Sign in
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">or continue with</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="space-y-3">
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-50 active:scale-95"
        >
          <Image src="/icons/search.png" alt="" width={16} height={16} className="h-4 w-4" />
          Continue with Google
        </button>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-50 active:scale-95"
        >
          <Image src="/icons/apple-logo.png" alt="" width={20} height={20} className="h-5 w-5" />
          Continue with Apple
        </button>
      </div>
    </div>
  )
}
