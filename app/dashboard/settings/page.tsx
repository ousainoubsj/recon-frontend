import SettingsDangerZone from '@/components/dashboard/SettingsDangerZone'
import SettingsQuickLinks from '@/components/dashboard/SettingsQuickLinks'
import SettingsReconciliationDefaults from '@/components/dashboard/SettingsReconciliationDefaults'

export default function Page() {
  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_400px]">
        <div className="">
        </div>

        <div className="space-y-6">
          <SettingsReconciliationDefaults />
          <SettingsDangerZone />
          <SettingsQuickLinks />
        </div>
      </div>
    </div>
  )
}
