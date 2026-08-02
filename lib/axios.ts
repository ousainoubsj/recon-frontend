import axios from "axios"
import type { ApiErrorBody, ApiFieldError } from "@/types/api"

// Mirrors recon-backend's middleware/errorHandler.js RFC 7807 response shape exactly.
export class ApiError extends Error {
  type: string
  status: number
  detail: string
  instance?: string
  errors?: ApiFieldError[]

  constructor(body: ApiErrorBody) {
    super(body.detail)
    this.name = body.title
    this.type = body.type
    this.status = body.status
    this.detail = body.detail
    this.instance = body.instance
    this.errors = body.errors
  }
}

const unknownErrorBody = (status: number, detail: string): ApiErrorBody => ({
  type: 'https://recon.app/errors/unknown-error',
  title: 'UnknownError',
  status,
  detail,
})

// Always NEXT_PUBLIC_API_URL, not a NODE_ENV-gated relative "/api" fallback —
// frontend (recon-cil.com) and backend (api.recon-cil.com) are separate
// origins in production too, not same-origin behind a rewrite.
export const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
  // Repeats array values as the same key (?tag=a&tag=b) instead of axios's
  // default `tag[]=a&tag[]=b` — matches what recon-backend's query parsers
  // expect, and drops undefined entries so callers can pass sparse param
  // objects straight through without filtering them first.
  paramsSerializer: {
    serialize: (params: Record<string, unknown>) => {
      const qs = new URLSearchParams()
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue
        if (Array.isArray(value)) {
          for (const v of value) qs.append(key, String(v))
        } else {
          qs.set(key, String(value))
        }
      }
      return qs.toString()
    },
  },
})

// Centralizes RFC 7807 error-body mapping so every call site just catches a
// real ApiError instead of an axios error shape — including the blob-typed
// case (postForBlob/getForBlob's responseType: 'blob' also applies to error
// responses, so a JSON error body arrives as a Blob needing re-parsing).
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || !error.response) {
      return Promise.reject(error)
    }

    let data: unknown = error.response.data
    if (data instanceof Blob) {
      const contentType = String(error.response.headers['content-type'] ?? '')
      data = undefined
      if (contentType.includes('application/json')) {
        try {
          data = JSON.parse(await error.response.data.text())
        } catch {
          data = undefined
        }
      }
    }

    const body =
      data && typeof data === 'object' && 'title' in data
        ? (data as ApiErrorBody)
        : unknownErrorBody(error.response.status, error.response.statusText || 'An unexpected error occurred')

    return Promise.reject(new ApiError(body))
  },
)
