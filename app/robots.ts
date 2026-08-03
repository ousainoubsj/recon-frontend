import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://recon-cil.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Authenticated app surface — nothing here is a public, indexable
      // page, and it's already excluded per-route via `robots: noindex`
      // metadata (see app/dashboard/layout.tsx, app/accept-invite). This
      // entry additionally keeps crawlers from spending budget on it.
      disallow: ['/dashboard', '/accept-invite'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
