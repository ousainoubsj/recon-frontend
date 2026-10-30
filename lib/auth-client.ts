import { createAuthClient } from "better-auth/react"
import { emailOTPClient, inferAdditionalFields, organizationClient } from "better-auth/client/plugins"

// Mirrors recon-backend auth.js's user additionalFields by hand: this repo can't import the server's types.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    organizationClient(),
    emailOTPClient(),
    inferAdditionalFields({
      user: {
        platformRole: { type: "string", required: false, input: false },
        platformStatus: { type: "string", required: false, input: false },
      },
    }),
  ],
})

export const { useSession, signIn, signOut, signUp } = authClient
