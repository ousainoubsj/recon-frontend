import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/lib/query-client";
import { ToastProvider } from "@/components/toast-provider";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://recon-cil.com";
const SITE_NAME = "Reconcil";
const SITE_DESCRIPTION =
  "Automate financial reconciliation, eliminate manual work, and close faster with complete accuracy and auditability.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Reconcil — Automated Financial Reconciliation Software",
    template: "%s | Reconcil",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "financial reconciliation software",
    "automated reconciliation",
    "transaction matching",
    "bank reconciliation",
    "account reconciliation",
    "reconciliation audit trail",
  ],
  authors: [{ name: "Reconcil" }],
  creator: "Reconcil",
  publisher: "Reconcil",
  category: "Business Software",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: "Reconcil — Automated Financial Reconciliation Software",
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reconcil — Automated Financial Reconciliation Software",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

// Dark is the default and is forced outside the dashboard, so the browser chrome stays dark
export const viewport: Viewport = {
  themeColor: "#050F20",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <QueryProvider>
            {children}
            <ToastProvider />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
