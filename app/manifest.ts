import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Reconcil — Automated Financial Reconciliation',
    short_name: 'Reconcil',
    description:
      'Automate financial reconciliation, eliminate manual work, and close faster with complete accuracy and auditability.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050F20',
    theme_color: '#050F20',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
