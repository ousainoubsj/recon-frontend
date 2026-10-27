import { useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '@/lib/axios'
import { resolveContentType, uploadToR2 } from '@/lib/files'
import { toastApiError } from '@/lib/toast'
import { reportKeys, useCreateDraft, useUpdateDraft } from './useReports'

type PresignResponse = { url: string; key: string }

async function presignAndUpload(file: File) {
  const contentType = resolveContentType(file)
  const { data } = await axiosInstance.post<PresignResponse>('/files/presign', { filename: file.name, contentType, size: file.size })
  await uploadToR2(data.url, file, contentType)
  return data.key
}

// Shared by UploadRecords (manual file picker) and the Sample Dataset flow
// (bundled static CSVs fetched as Blobs) — both feed into this exact same
// create-draft → presign+upload both files → patch-draft-with-keys sequence.
export function useUploadFiles() {
  const createDraft = useCreateDraft()
  const updateDraft = useUpdateDraft()

  return useMutation({
    mutationFn: async ({
      internal,
      counterparty,
      draftId,
    }: {
      internal: File
      counterparty: File
      draftId?: string
    }) => {
      const id = draftId ?? (await createDraft.mutateAsync(undefined)).id
      const [fileAKey, fileBKey] = await Promise.all([presignAndUpload(internal), presignAndUpload(counterparty)])
      await updateDraft.mutateAsync({
        id,
        input: { fileAKey, fileAName: internal.name, fileBKey, fileBName: counterparty.name },
      })
      return id
    },
  })
}

// Swaps one file on a draft, e.g. a corrected export before a rerun. The mapping preview is cached for the
// whole wizard session, so it's invalidated here to re-parse the new file.
export function useReplaceDraftFile() {
  const queryClient = useQueryClient()
  const updateDraft = useUpdateDraft()

  return useMutation({
    mutationFn: async ({ id, side, file }: { id: string; side: 'A' | 'B'; file: File }) => {
      const key = await presignAndUpload(file)
      const input = side === 'A' ? { fileAKey: key, fileAName: file.name } : { fileBKey: key, fileBName: file.name }
      await updateDraft.mutateAsync({ id, input })
    },
    onSuccess: (_data, { id }) => queryClient.invalidateQueries({ queryKey: reportKeys.mappingPreview(id) }),
    onError: (err) => toastApiError(err, 'Failed to replace file'),
  })
}
