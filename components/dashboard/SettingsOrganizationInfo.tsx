'use client'

import Image from 'next/image'
import { useRef, type ChangeEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'
import { useUploadOrgLogo } from '@/lib/hooks/useSettings'
import { COUNTRY_OPTIONS, CURRENCY_OPTIONS, DATE_FORMAT_OPTIONS, ORG_TYPE_OPTIONS } from '@/lib/settingsOptions'

export type OrgInfoDraft = {
  name: string
  orgType: string
  country: string
  dateFormat: string
  currency: string
}

type SettingsOrganizationInfoProps = {
  draft: OrgInfoDraft
  onChange: (draft: OrgInfoDraft) => void
  // Fired the moment a field is "committed" — blur for free-text (Name), and
  // immediately on selection for the Select fields (picking an option already
  // is the commit, there's no separate blur worth waiting for).
  onCommitField: (field: keyof OrgInfoDraft, value: string) => void
  isLoading?: boolean
}

export default function SettingsOrganizationInfo({ draft, onChange, onCommitField, isLoading }: SettingsOrganizationInfoProps) {
  const { data: activeOrg } = authClient.useActiveOrganization()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadLogo = useUploadOrgLogo()

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    uploadLogo.mutate(file)
  }

  return (
    <div className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0A1121]/60 p-3">
      <h3 className="text-lg font-semibold text-white">Organization Information</h3>

      <div className="mt-2 space-y-3.5">
        <div>
          <label className="mb-2 block text-sm text-slate-400">Company Logo</label>
          <div className="flex items-center gap-3">
            {isLoading ? (
              <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white p-2">
                <Image
                  src={activeOrg?.logo || '/Datafin-logo-png%20copy.png'}
                  alt="Company logo"
                  width={56}
                  height={56}
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            <div className="min-w-0">
              {isLoading ? (
                <>
                  <Skeleton className="h-7 w-24 rounded-lg" />
                  <Skeleton className="mt-1.5 h-3 w-28" />
                </>
              ) : (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadLogo.isPending}
                    className="flex cursor-pointer items-center gap-1 rounded-lg border border-[#232D47] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {uploadLogo.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {uploadLogo.isPending ? 'Uploading...' : 'Change Logo'}
                  </button>
                  <p className="mt-1.5 text-xs text-slate-500">PNG or SVG. Max 2MB.</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">Organization Name</label>
          {isLoading ? (
            <Skeleton className="h-9 w-full rounded-lg" />
          ) : (
            <input
              type="text"
              value={draft.name}
              onChange={(e) => onChange({ ...draft, name: e.target.value })}
              onBlur={() => onCommitField('name', draft.name)}
              className="w-full h-9! rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-white focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
            />
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">Organization Type</label>
          {isLoading ? (
            <Skeleton className="h-9 w-full rounded-lg" />
          ) : (
            <Select
              value={draft.orgType}
              onValueChange={(value) => {
                onChange({ ...draft, orgType: value as string })
                onCommitField('orgType', value as string)
              }}
            >
              <SelectTrigger className="h-auto! w-full border-[#232D47] bg-[#0A1128] py-2 text-sm text-white">
                <SelectValue placeholder="Select organization type" />
              </SelectTrigger>
              <SelectContent>
                {ORG_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">Country</label>
          {isLoading ? (
            <Skeleton className="h-9 w-full rounded-lg" />
          ) : (
            <Select
              value={draft.country}
              onValueChange={(value) => {
                onChange({ ...draft, country: value as string })
                onCommitField('country', value as string)
              }}
            >
              <SelectTrigger className="h-auto! w-full border-[#232D47] bg-[#0A1128] py-2 text-sm text-white">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">Date Format</label>
          {isLoading ? (
            <Skeleton className="h-9 w-full rounded-lg" />
          ) : (
            <Select
              value={draft.dateFormat}
              onValueChange={(value) => {
                onChange({ ...draft, dateFormat: value as string })
                onCommitField('dateFormat', value as string)
              }}
              items={DATE_FORMAT_OPTIONS}
            >
              <SelectTrigger className="h-auto! w-full border-[#232D47] bg-[#0A1128] py-2 text-sm text-white">
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMAT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">Currency</label>
          {isLoading ? (
            <Skeleton className="h-9 w-full rounded-lg" />
          ) : (
            <Select
              value={draft.currency}
              onValueChange={(value) => {
                onChange({ ...draft, currency: value as string })
                onCommitField('currency', value as string)
              }}
              items={CURRENCY_OPTIONS}
            >
              <SelectTrigger className="h-auto! w-full border-[#232D47] bg-[#0A1128] py-2 text-sm text-white">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  )
}
