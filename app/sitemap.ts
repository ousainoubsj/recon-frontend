import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://recon-cil.com'

// The only public, indexable route is the sign-in/sign-up screen at "/" —
// everything under /dashboard requires an authenticated session and
// /accept-invite/[id] is a private, per-invitation URL, so neither belongs
// in a public sitemap (see app/robots.ts, which excludes both from crawling).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}
