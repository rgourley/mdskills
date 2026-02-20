import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin', '/create'],
      },
    ],
    sitemap: 'https://www.mdskills.ai/sitemap.xml',
  }
}
