import { useMutation } from '@tanstack/react-query'
import { axiosInstance } from '@/lib/axios'
import { toastApiError } from '@/lib/toast'

export function useSendHelpRequest() {
  return useMutation({
    mutationFn: async (message: string) => {
      await axiosInstance.post('/support', { message })
    },
    onError: (err) => toastApiError(err, 'Failed to send your message'),
  })
}
