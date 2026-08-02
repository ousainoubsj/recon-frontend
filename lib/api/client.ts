import axios from "axios"
import type { ApiErrorBody, ApiFieldError } from "@/types/api"

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`

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

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

type RequestOptions = {
  query?: Record<string, string | number | boolean | string[] | undefined>
  signal?: AbortSignal
}

function buildPath(path: string, query?: RequestOptions['query']) {
  if (!query) return path
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, String(v))
    } else {
      params.set(key, String(value))
    }
  }
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

const unknownErrorBody = (status: number, detail: string): ApiErrorBody => ({
  type: 'https://recon.app/errors/unknown-error',
  title: 'UnknownError',
  status,
  detail,
})

async function request<T>(path: string, init: { method: string; body?: unknown } & RequestOptions = { method: 'GET' }): Promise<T> {
  const { method, body, query, signal } = init
  try {
    const res = await axiosClient.request<T>({ url: buildPath(path, query), method, data: body, signal })
    if (res.status === 204) return undefined as T
    return res.data
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      throw new ApiError(err.response.data ?? unknownErrorBody(err.response.status, err.response.statusText || 'An unexpected error occurred'))
    }
    throw err
  }
}

// For endpoints that stream a binary file (e.g. bulk-export's zip) instead of
// JSON — bypasses `request()`'s json-only body parsing and instead resolves
// the raw Blob plus whatever filename the server suggested via
// Content-Disposition, for the caller to feed into a download trigger.
async function requestBlob(path: string, init: { method: string; body?: unknown } & RequestOptions): Promise<{ blob: Blob; filename: string }> {
  const { method, body, query, signal } = init
  try {
    const res = await axiosClient.request<Blob>({ url: buildPath(path, query), method, data: body, signal, responseType: 'blob' })
    const disposition = res.headers['content-disposition'] ?? ''
    const filename = /filename="?([^"]+)"?/.exec(disposition)?.[1] ?? 'download'
    return { blob: res.data, filename }
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const contentType = String(err.response.headers['content-type'] ?? '')
      const data = err.response.data
      let body: ApiErrorBody | undefined
      if (contentType.includes('application/json') && data instanceof Blob) {
        try {
          body = JSON.parse(await data.text())
        } catch {
          body = undefined
        }
      }
      throw new ApiError(body ?? unknownErrorBody(err.response.status, err.response.statusText || 'An unexpected error occurred'))
    }
    throw err
  }
}

export const apiFetch = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { method: 'GET', ...options }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { method: 'POST', body, ...options }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { method: 'PATCH', body, ...options }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { method: 'PUT', body, ...options }),
  del: <T>(path: string, options?: RequestOptions) => request<T>(path, { method: 'DELETE', ...options }),
  postForBlob: (path: string, body?: unknown, options?: RequestOptions) => requestBlob(path, { method: 'POST', body, ...options }),
  getForBlob: (path: string, options?: RequestOptions) => requestBlob(path, { method: 'GET', ...options }),
}
