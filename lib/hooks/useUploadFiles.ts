import { useMutation } from '@tanstack/react-query'
import { presign, resolveContentType, uploadToR2 } from '@/lib/api/files'
import { useCreateDraft, useUpdateDraft } from './useReports'

async function presignAndUpload(file: File) {
  const contentType = resolveContentType(file)
  const { url, key } = await presign({ filename: file.name, contentType, size: file.size })
  await uploadToR2(url, file, contentType)
  return key
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
