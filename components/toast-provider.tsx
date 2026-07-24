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
          background: "#0A1128",
          color: "#1CEAEA",
          maxWidth: "none",
          border: "1px solid #232D47",
        },
        success: {
          style: {
            background: "#0A1128",
            color: "#1CEAEA",
            border: "1px solid #232D47",
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
