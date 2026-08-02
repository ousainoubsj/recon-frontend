import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from '@/lib/axios'
import { toastApiError } from '@/lib/toast'
import type { ReportTemplate } from '@/types/reports'

export const reportTemplateKeys = {
  list: ['reportTemplates', 'list'] as const,
}

export function useReportTemplates() {
  return useQuery({
    queryKey: reportTemplateKeys.list,
    queryFn: async () => {
      try {
        return (await axiosInstance.get<ReportTemplate[]>('/report-templates')).data
      } catch (err) {
        toastApiError(err, 'Failed to load report templates')
        throw err
      }
    },
  })
}
