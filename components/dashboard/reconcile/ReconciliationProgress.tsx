'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/format'

const strandOffsets = [-36, -21, -9, 9, 21, 36]

const sparkles = [
  { x: 130, y: 70, r: 1.6, o: 0.9 },
  { x: 175, y: 155, r: 1.2, o: 0.6 },
  { x: 230, y: 95, r: 1.8, o: 0.8 },
  { x: 265, y: 145, r: 1.1, o: 0.5 },
  { x: 310, y: 75, r: 1.4, o: 0.7 },
  { x: 350, y: 130, r: 1, o: 0.5 },
  { x: 395, y: 100, r: 1.5, o: 0.7 },
  { x: 655, y: 155, r: 1.4, o: 0.6 },
  { x: 700, y: 90, r: 1.1, o: 0.5 },
  { x: 740, y: 140, r: 1.7, o: 0.8 },
  { x: 785, y: 75, r: 1.2, o: 0.6 },
  { x: 825, y: 150, r: 1.5, o: 0.7 },
  { x: 865, y: 95, r: 1.1, o: 0.5 },
]

function WaveStrands({ color, direction }: { color: string; direction: 'left' | 'right' }) {
  const anchorX = direction === 'left' ? 90 : 910
  const centerX = 500

  return (
    <>
      {strandOffsets.map((offset, i) => {
        const anchorY = 120 + offset
        const controlX = direction === 'left' ? (anchorX + centerX) / 2 + 40 : (anchorX + centerX) / 2 - 40
        const d =
          direction === 'left'
            ? `M${anchorX},${anchorY} Q${controlX},${anchorY} ${centerX},120`
            : `M${centerX},120 Q${controlX},${anchorY} ${anchorX},${anchorY}`
        const isCore = i === 2 || i === 3
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={isCore ? 1.6 : 0.7}
            opacity={isCore ? 0.9 : 0.35}
          />
        )
      })}
    </>
  )
}

function FolderGraphic({ color, label, rows }: { color: string; label: string; rows: string }) {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <div className="absolute inset-0 rounded-2xl blur-xl" style={{ backgroundColor: `${color}22` }} />
      <div className="relative flex h-full w-full rotate-6 items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <path
            d="M18 30 L18 22 C18 18.5 20.5 16 24 16 L40 16 C42 16 43.5 17 44.5 18.5 L47 22 L82 22 C85.5 22 88 24.5 88 28 L88 78 C88 81.5 85.5 84 82 84 L18 84 C14.5 84 12 81.5 12 78 L12 36 C12 32.5 14.5 30 18 30 Z"
            fill={`${color}0f`}
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        <svg viewBox="0 0 40 40" className="relative h-9 w-9" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 5 L13 5 L16.5 8 L13 11 L4 11 Z" />
          <path d="M26.3 10.4 C24.8 10.4 23.7 9.1 24 7.7 C24.2 6.5 25.3 5.7 26.5 5.8 C26.8 4.1 28.3 3 29.9 3.4 C31.2 3.6 32.2 4.7 32.3 6 C33.7 6.2 34.6 7.4 34.5 8.8 C34.4 10.2 33.2 11.1 31.8 11 L26.3 11 Z" />
          <path d="M16.5 8 L23.5 7.5" />
          <rect x="4" y="22" width="14" height="11" rx="2" />
          <rect x="22" y="22" width="14" height="11" rx="2" />
          <path d="M9 11 L9 22" />
          <path d="M29 11 L29 22" />
        </svg>
      </div>

      <div className="absolute top-full left-1/2 mt-2 w-max -translate-x-1/2 text-center">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="mt-1 text-xs text-slate-300">{rows}</p>
      </div>
    </div>
  )
}

function CenterRing() {
  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <div className="absolute inset-4 rounded-full bg-sky-400/20 blur-xl" />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="centerRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="44" fill="#0A1022" stroke="url(#centerRingGradient)" strokeWidth="2" opacity="0.9" />
      </svg>
      {/* Separate spinning svg, same technique as LogoLoader — the static
          dasharray arc actually rotates around the ring instead of sitting
          fixed at one spot. dash+gap is set to exactly the r=48 circle's
          circumference (2π×48 ≈ 301.6) — a mismatched total (e.g. the old
          "10 275" = 285) leaves a stray leftover sliver where the repeating
          pattern doesn't close cleanly, which read as a second broken line
          next to the main arc. */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-spin" style={{ animationDuration: '1.4s' }}>
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="30 271.6"
        />
      </svg>
      <Image src="/images/logo-sym.png" alt="" width={64} height={64} className="relative h-16 w-16 rounded-2xl" />
    </div>
  )
}

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

type ReconciliationProgressProps = {
  fileARows?: number
  fileBRows?: number
}

// /run is a single synchronous backend call — no live progress channel to
// poll — so this is an honest indeterminate loading view (elapsed time, not
// a fake percentage/ETA) bound to the run mutation's pending state, shown
// only while that one call is in flight; the wizard auto-advances to
// Results the instant it resolves (see ReconciliationWizard).
export default function ReconciliationProgress({ fileARows, fileBRows }: ReconciliationProgressProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reconciliation in Progress</h1>
          <p className="mt-1 text-sm text-[#A3B2C8]">Sit tight! Our engine is working its magic. You&apos;ll be notified when it&apos;s done.</p>
        </div>

        <Button
          type="button"
          disabled
          className="shrink-0 cursor-not-allowed rounded-md bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 p-4 font-medium text-white opacity-50 shadow-sm"
        >
          View Results
        </Button>
      </div>

      <div className="relative mx-auto h-54 w-full">
        <svg viewBox="0 0 1000 240" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <WaveStrands color="#2dd4bf" direction="left" />
          <WaveStrands color="#818cf8" direction="right" />
          {sparkles.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={i < 7 ? '#5eead4' : '#a5b4fc'} opacity={s.o} />
          ))}
        </svg>

        <div className="absolute top-1/2 left-0 -translate-y-1/2">
          <FolderGraphic color="#2dd4bf" label="Internal Ledger" rows={fileARows != null ? `${formatNumber(fileARows)} rows` : '—'} />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <CenterRing />
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2">
          <FolderGraphic color="#818cf8" label="Counterparty File" rows={fileBRows != null ? `${formatNumber(fileBRows)} rows` : '—'} />
        </div>
      </div>

      <div className="text-center -mt-6">
        <p className="text-4xl font-bold text-white">{formatElapsed(elapsed)}</p>
        <p className="mt-2 text-sm font-medium text-slate-300">Processing...</p>
      </div>

      {/* Indeterminate slide, not a static full-width bar just pulsing
          opacity — there's no real percentage to show (see the comment
          above), so the bar itself shouldn't look "done." */}
      <div className="relative mx-auto mt-6 h-2 w-full max-w-2xl overflow-hidden rounded-full bg-[#1B2540]">
        <div
          className="absolute inset-y-0 rounded-full bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500"
          style={{ animation: 'indeterminate-bar 1.5s ease-in-out infinite' }}
        />
      </div>

      <p className="mt-4 text-center text-sm text-slate-300">This can take a moment for larger files — please don&apos;t close this tab.</p>
    </div>
  )
}
