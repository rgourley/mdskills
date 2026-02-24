/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async rewrites() {
    // Type-specific detail routes all resolve to the shared /skills/[slug] page
    return [
      { source: '/tools/:slug', destination: '/skills/:slug' },
      { source: '/plugins/:slug', destination: '/skills/:slug' },
      { source: '/mcp-servers/:slug', destination: '/skills/:slug' },
      { source: '/rules/:slug', destination: '/skills/:slug' },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
