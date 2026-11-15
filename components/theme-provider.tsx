"use client"

import { usePathname } from "next/navigation"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Auth and invite pages are styled for the dark html class only; just the dashboard follows the user's choice
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith("/dashboard")

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      forcedTheme={isDashboard ? undefined : "dark"}
    >
      {children}
    </NextThemesProvider>
  )
}
