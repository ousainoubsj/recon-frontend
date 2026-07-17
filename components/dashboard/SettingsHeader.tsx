import Image from 'next/image'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SettingsHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0">
          <Image src="/icons/settings.png" alt="" width={64} height={64} className="h-full w-full scale-150 object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-[#A3B2C8]">Manage your account and workspace preferences.</p>
        </div>
      </div>

      <Button
        type="button"
        className="cursor-pointer rounded-md bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 p-4 font-medium text-white shadow-sm transition-all duration-300 active:scale-95"
      >
        <Save className="h-4 w-4" />
        Save Changes
      </Button>
    </div>
  )
}
