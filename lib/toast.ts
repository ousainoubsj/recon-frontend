import toast from "react-hot-toast"
import { ApiError } from "./axios"

export { toast }

// Standard onError handler for mutation/query hooks — one line at each call site:
// onError: (err) => toastApiError(err)
export function toastApiError(err: unknown, fallbackMessage = "Something went wrong") {
  if (err instanceof ApiError) {
    toast.error(`${err.name}: ${err.detail}`)
    return
  }
  toast.error(fallbackMessage)
}

// Better Auth client calls return { data, error } rather than throwing —
// error is a BetterFetchError-shaped object with a `message`, not an
// ApiError. Used anywhere authClient.* is called directly (AuthForm, and
// later the organization-plugin calls in Team/Settings).
export function authErrorMessage(error: { message?: string } | null, fallback: string) {
  return error?.message || fallback
}
