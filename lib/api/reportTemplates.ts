import { apiFetch } from './client'
import type { ReportSections, ReportTemplate } from '@/types/reports'

export function list() {
  return apiFetch.get<ReportTemplate[]>('/report-templates')
}

export function create(input: { name: string; description?: string; sections?: ReportSections }) {
  return apiFetch.post<ReportTemplate>('/report-templates', input)
}

export function remove(id: string) {
  return apiFetch.del<void>(`/report-templates/${id}`)
}
