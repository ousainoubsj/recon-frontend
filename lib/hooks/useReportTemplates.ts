import { useQuery } from '@tanstack/react-query'
import * as reportTemplatesApi from '@/lib/api/reportTemplates'
import { toastApiError } from '@/lib/toast'

export const reportTemplateKeys = {
  list: ['reportTemplates', 'list'] as const,
}

export function useReportTemplates() {
  return useQuery({
    queryKey: reportTemplateKeys.list,
    queryFn: async () => {
      try {
        return await reportTemplatesApi.list()
      } catch (err) {
        toastApiError(err, 'Failed to load report templates')
        throw err
      }
    },
  })
}
