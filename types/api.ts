export type ApiFieldError = {
  field: string
  message: string
}

// Mirrors recon-backend's middleware/errorHandler.js RFC 7807 response body shape.
export type ApiErrorBody = {
  type: string
  title: string
  status: number
  detail: string
  instance?: string
  errors?: ApiFieldError[]
}
