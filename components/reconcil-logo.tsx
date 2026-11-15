import Image from "next/image"

import { cn } from "@/lib/utils"

// The wordmark is raster, so tokens can't recolour it: each theme gets its own artwork
export function ReconcilLogo({ className }: { className?: string }) {
  return (
    <>
      <Image src="/images/Reconcil-logo.png" alt="Reconcil" width={380} height={127} className={cn("hidden dark:block", className)} />
      <Image src="/images/Reconcil-logo-light.png" alt="Reconcil" width={380} height={127} className={cn("dark:hidden", className)} />
    </>
  )
}
