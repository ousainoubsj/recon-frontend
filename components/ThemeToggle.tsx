'use client'

import { useState } from 'react'
import { MoonIcon, SunIcon } from '@/components/icons'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-white/80 p-1 shadow-sm ring-1 ring-slate-900/5 backdrop-blur">
      <button
        type="button"
        aria-label="Light mode"
        onClick={() => setDark(false)}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
          !dark ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <SunIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Dark mode"
        onClick={() => setDark(true)}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
          dark ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <MoonIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
