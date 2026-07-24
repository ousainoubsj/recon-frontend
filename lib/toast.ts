import toast from "react-hot-toast"
import { ApiError } from "./api/client"

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
