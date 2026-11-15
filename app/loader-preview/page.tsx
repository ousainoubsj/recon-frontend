import { LogoLoader } from '@/components/ui/logo-loader'

export default function LoaderPreview() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#050F20]">
      <LogoLoader className="scale-[2.5]" />
    </div>
  )
}
