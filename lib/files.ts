import { formatFileSize } from '@/lib/format'

// Mirrors recon-backend's controllers/files.controller.js exactly — kept
// here so the frontend can reject an obviously-bad file immediately on
// selection instead of only finding out after a round trip to /presign.
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
const ALLOWED_CONTENT_TYPES = new Set([
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])

// The browser's reported MIME type for a file can be unreliable (empty or
// 'text/plain' for .csv depending on OS) — fall back to extension so it
// matches one of the 3 content-types the backend's presign endpoint
// actually allows, since a mismatch here causes a silent R2 signature
// failure on the PUT below.
export function resolveContentType(file: File): string {
  if (file.type) return file.type
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'csv') return 'text/csv'
  if (ext === 'xls') return 'application/vnd.ms-excel'
  if (ext === 'xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  return 'application/octet-stream'
}

// Returns a user-facing error message, or null if the file is fine to
// upload. Checked immediately on file selection/drop — same rules the
// backend enforces (size, then content type), just surfaced right away
// instead of after a wasted presign+PUT round trip.
export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is too large (max ${formatFileSize(MAX_FILE_SIZE_BYTES)})`
  }
  if (!ALLOWED_CONTENT_TYPES.has(resolveContentType(file))) {
    return 'Unsupported file type — please upload a CSV, XLS, or XLSX file'
  }
  return null
}

// A direct-to-R2 PUT — deliberately not through axiosInstance, which always
// targets our own API origin, forces withCredentials, and isn't set up for
// raw file bytes with a specific, signature-bound Content-Type.
export async function uploadToR2(url: string, file: File, contentType: string) {
  const res = await fetch(url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': contentType },
  })
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status})`)
  }
}
