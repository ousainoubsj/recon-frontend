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

type RequestOptions = {
  query?: Record<string, string | number | boolean | string[] | undefined>
  signal?: AbortSignal
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = new URL(`${API_BASE_URL}${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue
      if (Array.isArray(value)) {
        for (const v of value) url.searchParams.append(key, v)
      } else {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

async function request<T>(path: string, init: RequestInit & RequestOptions = {}): Promise<T> {
  const { query, signal, ...rest } = init
  const hasBody = rest.body !== undefined
  const res = await fetch(buildUrl(path, query), {
    ...rest,
    signal,
    credentials: 'include',
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...rest.headers,
    },
  })

  if (res.status === 204) return undefined as T

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await res.json() : undefined

  if (!res.ok) {
    throw new ApiError(
      body ?? {
        type: 'https://recon.app/errors/unknown-error',
        title: 'UnknownError',
        status: res.status,
        detail: res.statusText || 'An unexpected error occurred',
      },
    )
  }

  return body as T
}

export const apiFetch = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { method: 'GET', ...options }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined, ...options }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined, ...options }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined, ...options }),
  del: <T>(path: string, options?: RequestOptions) => request<T>(path, { method: 'DELETE', ...options }),
}
