import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function SettingsHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="">
        <div>
          <h1 className="text-2xl font-bold text-white">General Settings</h1>
          <p className="mt-1 text-sm text-[#A3B2C8]">Configure the basic settings for your ReconcilePro account and organization.</p>
        </div>
      </div>

      <Button
        type="button"
        className="cursor-pointer rounded-md bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 p-4 font-medium text-white shadow-sm transition-all duration-300 active:scale-95"
      >
        Save Changes
      </Button>
    </div>
  )
}
