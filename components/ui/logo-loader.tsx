import { cn } from "@/lib/utils"

import s from "./logo-loader.module.css"

// Animated Reconcil logo, drawn on the brand artwork's 2170×725 grid; pure SVG + CSS, no runtime deps.
// Rows are [y, left pill end, right pill start]; pills run from x 214 to 582 around the spine at 405.
const MATCHED_ROWS = [
  [305, 318, 478],
  [362, 336, 458],
] as const
const BREAK_ROW = [418, 304, 492] as const
const PENDING_ROW = [476, 330, 466] as const
const SPINE_X = 405
const ROW_DELAY_S = 0.08
// Each row's pulse fires as the scanner (starts 1.6s, ~0.25s per row) passes it
const pulseDelay = (row: number) => `${1.6 + row * 0.27}s`

function Pills({ y, leftEnd, rightStart, row, opacity }: { y: number; leftEnd: number; rightStart: number; row: number; opacity: number }) {
  const delay = { animationDelay: `${0.45 + row * ROW_DELAY_S}s` }
  return (
    <g fill="#fff" fillOpacity={opacity}>
      <rect className={s.pillLeft} style={delay} x="214" y={y - 14} width={leftEnd - 214} height="28" rx="14" />
      <rect className={s.pillRight} style={delay} x={rightStart} y={y - 14} width={582 - rightStart} height="28" rx="14" />
    </g>
  )
}

export function LogoLoader({ className }: { className?: string }) {
  const linkDelay = (row: number) => ({ animationDelay: `${0.8 + row * ROW_DELAY_S}s` })
  const dotDelay = (row: number) => ({ animationDelay: `${0.95 + row * ROW_DELAY_S}s` })

  return (
    <div role="status" aria-label="Loading" className={cn("flex items-center justify-center", className)}>
      <svg viewBox="140 100 1900 520" className={`${s.svg} h-auto w-72 sm:w-96`} aria-hidden="true">
        <defs>
          <linearGradient id="recon-ld-tile" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#13B5A2" />
            <stop offset="0.55" stopColor="#0B8FB0" />
            <stop offset="1" stopColor="#0A57AA" />
          </linearGradient>
          <linearGradient id="recon-ld-scan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id="recon-ld-tile-clip">
            <rect x="152" y="115" width="494" height="494" rx="110" />
          </clipPath>
          <clipPath id="recon-ld-rule">
            <rect x="750" y="480" width="1267" height="14" />
          </clipPath>
        </defs>

        <rect className={s.tile} x="152" y="115" width="494" height="494" rx="110" fill="url(#recon-ld-tile)" />
        <rect className={s.spine} x={SPINE_X - 4} y="212" width="8" height="300" rx="4" fill="#fff" fillOpacity="0.3" />

        {/* Row 0: the confirmed match */}
        <Pills y={248} leftEnd={348} rightStart={448} row={0} opacity={1} />
        <line className={s.link} style={linkDelay(0)} x1="350" y1="245" x2="446" y2="245" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        <path className={s.check} d="M377 262 L391 275 L413 252" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

        {MATCHED_ROWS.map(([y, leftEnd, rightStart], i) => (
          <g key={y}>
            <Pills y={y} leftEnd={leftEnd} rightStart={rightStart} row={i + 1} opacity={0.75 - i * 0.08} />
            <line className={s.link} style={linkDelay(i + 1)} x1={leftEnd + 4} y1={y} x2={rightStart - 4} y2={y} stroke="#fff" strokeOpacity="0.85" strokeWidth="4" />
            <circle className={s.pulse} style={{ animationDelay: pulseDelay(i + 1) }} cx={SPINE_X} cy={y} r="10" fill="#fff" />
            <circle className={s.dot} style={dotDelay(i + 1)} cx={SPINE_X} cy={y} r="10" fill="#fff" />
          </g>
        ))}

        {/* Row 3: a break, flagged yellow */}
        <Pills y={BREAK_ROW[0]} leftEnd={BREAK_ROW[1]} rightStart={BREAK_ROW[2]} row={3} opacity={0.6} />
        <line className={s.link} style={linkDelay(3)} x1={BREAK_ROW[1] + 4} y1={BREAK_ROW[0]} x2={BREAK_ROW[2] - 4} y2={BREAK_ROW[0]} stroke="#FACC15" strokeWidth="5" />
        <circle className={s.pulse} style={{ animationDelay: pulseDelay(3) }} cx={SPINE_X} cy={BREAK_ROW[0]} r="12" fill="#FACC15" />
        <circle className={s.dot} style={dotDelay(3)} cx={SPINE_X} cy={BREAK_ROW[0]} r="12" fill="#FACC15" />

        {/* Row 4: unmatched — both paths are drawn towards the spine so the dashes flow inwards */}
        <Pills y={PENDING_ROW[0]} leftEnd={PENDING_ROW[1]} rightStart={PENDING_ROW[2]} row={4} opacity={0.5} />
        <g stroke="#fff" strokeOpacity="0.6" strokeWidth="4" strokeDasharray="12 10">
          <path className={s.pending} d={`M${PENDING_ROW[1] + 4} ${PENDING_ROW[0]} H${SPINE_X - 20}`} />
          <path className={s.pending} d={`M${PENDING_ROW[2] - 4} ${PENDING_ROW[0]} H${SPINE_X + 20}`} />
        </g>

        <g clipPath="url(#recon-ld-tile-clip)">
          <rect className={s.scan} x="152" y="190" width="494" height="60" fill="url(#recon-ld-scan)" />
        </g>

        <text className={s.word} x="750" y="440" fontFamily="var(--font-geist-sans), sans-serif" fontSize="290" textLength="1070" lengthAdjust="spacingAndGlyphs">
          <tspan fill="var(--foreground)" fontWeight="800">recon</tspan>
          <tspan fill="#14A098" fontWeight="500">cil</tspan>
        </text>

        <g className={s.rule}>
          <line x1="750" y1="487" x2="2017" y2="487" stroke="#7C8BA8" strokeOpacity="0.7" strokeWidth="3" />
          <g clipPath="url(#recon-ld-rule)">
            <rect className={s.runner} x="550" y="484" width="200" height="7" rx="3.5" fill="var(--brand)" />
          </g>
        </g>

        <text className={s.sub} x="752" y="556" fontFamily="var(--font-geist-sans), sans-serif" fontSize="56" fill="var(--fg-secondary)" textLength="1266" lengthAdjust="spacing">
          TRANSACTION RECONCILIATION
        </text>
      </svg>
    </div>
  )
}
