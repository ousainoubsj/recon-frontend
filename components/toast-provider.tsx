"use client"

import { Toaster } from "react-hot-toast"

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          whiteSpace: "nowrap",
          width: "auto",
          background: "var(--surface)",
          color: "var(--brand-text)",
          maxWidth: "none",
          border: "1px solid var(--line)",
        },
        success: {
          style: {
            background: "var(--surface)",
            color: "var(--brand-text)",
            border: "1px solid var(--line)",
          },
        },
        error: {
          style: {
            background: "#7F1D1D",
            color: "#FCA5A5",
          },
        },
      }}
    />
  )
}
