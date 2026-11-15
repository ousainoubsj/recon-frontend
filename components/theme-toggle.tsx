"use client"

import { useSyncExternalStore } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  // resolvedTheme comes from localStorage on the client only; the server snapshot keeps hydration consistent
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const isDark = !mounted || resolvedTheme === "dark"

  return (
    <div className="flex items-center gap-2">
      <Sun className={cn("h-4 w-4 transition-colors duration-300", isDark ? "text-fg-subtle" : "text-foreground")} />
      <Switch
        checked={isDark}
        disabled={!mounted}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Dark mode"
      />
      <Moon className={cn("h-4 w-4 transition-colors duration-300", isDark ? "text-foreground" : "text-fg-subtle")} />
    </div>
  )
}
