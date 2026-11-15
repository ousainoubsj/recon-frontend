import { LogoLoader } from '@/components/ui/logo-loader'

export default function LoaderPreview() {
  return (
    <div className="flex h-screen items-center justify-center bg-surface-base">
      <LogoLoader className="scale-[2.5]" />
    </div>
  )
}
