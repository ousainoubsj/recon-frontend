import SettingsDangerZone from '@/components/dashboard/SettingsDangerZone'
import SettingsHeader from '@/components/dashboard/SettingsHeader'
import SettingsNotifications from '@/components/dashboard/SettingsNotifications'
import SettingsOrganizationInfo from '@/components/dashboard/SettingsOrganizationInfo'
import SettingsQuickLinks from '@/components/dashboard/SettingsQuickLinks'
import SettingsReconciliationDefaults from '@/components/dashboard/SettingsReconciliationDefaults'
import SettingsRecentActivity from '@/components/dashboard/SettingsRecentActivity'

export default function Page() {
  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0 space-y-6">
          <SettingsHeader />

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[30%_1fr]">
            <SettingsOrganizationInfo />
            <div className="min-w-0 space-y-6">
              <SettingsRecentActivity />
              <SettingsNotifications />
            </div>
          </div>
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
