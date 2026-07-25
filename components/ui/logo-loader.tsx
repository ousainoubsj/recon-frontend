import Image from "next/image"
import { cn } from "@/lib/utils"

type LogoLoaderProps = {
  size?: number
  className?: string
}

// A spinning gradient ring around the app logo — used anywhere the app needs
// a "loading between pages" state (e.g. the dashboard layout's session
// check), instead of a generic spinner icon.
export function LogoLoader({ size = 96, className }: LogoLoaderProps) {
  const logoSize = Math.round(size * 0.58)

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <div className="absolute inset-2 animate-pulse rounded-full bg-teal-400/20 blur-xl" />

      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full animate-spin"
        style={{ animationDuration: "1.4s" }}
      >
        <defs>
          <linearGradient id="logoLoaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#1CEAEA" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="none" stroke="#232D47" strokeWidth="3" />
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="url(#logoLoaderGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="70 219"
        />
      </svg>

      <Image
        src="/images/logo-sym.png"
        alt=""
        width={logoSize}
        height={logoSize}
        className="relative rounded-2xl"
        style={{ width: logoSize, height: logoSize }}
      />
    </div>
  )
}
