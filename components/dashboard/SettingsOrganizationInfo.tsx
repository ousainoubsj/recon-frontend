'use client'

import Image from 'next/image'
import { useRef, useState, type ChangeEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { authClient } from '@/lib/auth-client'
import { toast } from '@/lib/toast'
import * as settingsApi from '@/lib/api/settings'
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
}

const LOGO_MAX_SIZE_BYTES = 2 * 1024 * 1024

export default function SettingsOrganizationInfo({ draft, onChange }: SettingsOrganizationInfoProps) {
  const { data: activeOrg } = authClient.useActiveOrganization()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  const handleLogoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !activeOrg) return

    if (file.size > LOGO_MAX_SIZE_BYTES) {
      toast.error('Logo must be 2MB or smaller')
      return
    }
    if (file.type !== 'image/png' && file.type !== 'image/svg+xml') {
      toast.error('Only PNG or SVG files are accepted')
      return
    }

    setIsUploadingLogo(true)
    try {
      const { url, publicUrl } = await settingsApi.presignOrganizationLogo({
        filename: file.name,
        contentType: file.type,
        size: file.size,
      })
      const putRes = await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      if (!putRes.ok) throw new Error('Upload failed')

      const { error } = await authClient.organization.update({
        data: { logo: publicUrl },
        organizationId: activeOrg.id,
      })
      if (error) throw new Error(error.message ?? 'Failed to update logo')

      toast.success('Logo updated')
    } catch {
      toast.error('Failed to update logo')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  return (
    <div className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0A1121]/60 p-3">
      <h3 className="text-lg font-semibold text-white">Organization Information</h3>

      <div className="mt-2 space-y-3.5">
        <div>
          <label className="mb-2 block text-sm text-slate-400">Company Logo</label>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white p-2">
              <Image
                src={activeOrg?.logo || '/Datafin-logo-png%20copy.png'}
                alt="Company logo"
                width={56}
                height={56}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
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
                disabled={isUploadingLogo}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#232D47] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploadingLogo && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isUploadingLogo ? 'Uploading...' : 'Change Logo'}
              </button>
              <p className="mt-1.5 text-xs text-slate-500">PNG or SVG. Max 2MB.</p>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">Organization Name</label>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
            className="w-full h-9! rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-white focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">Organization Type</label>
          <Select value={draft.orgType} onValueChange={(value) => onChange({ ...draft, orgType: value as string })}>
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
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">Country</label>
          <Select value={draft.country} onValueChange={(value) => onChange({ ...draft, country: value as string })}>
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
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">Date Format</label>
          <Select
            value={draft.dateFormat}
            onValueChange={(value) => onChange({ ...draft, dateFormat: value as string })}
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
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">Currency</label>
          <Select
            value={draft.currency}
            onValueChange={(value) => onChange({ ...draft, currency: value as string })}
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
        </div>
      </div>
    </div>
  )
}
