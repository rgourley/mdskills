import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from '@/i18n/config'

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
})

const PROTECTED_ROUTES = ['/admin', '/collections', '/settings', '/profile', '/submit', '/dashboard']
const AUTH_ROUTES = ['/login', '/signup']

/** Strip locale prefix from pathname for route matching */
function stripLocale(pathname: string): string {
  for (const locale of locales) {
    if (locale === defaultLocale) continue
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return pathname.slice(`/${locale}`.length) || '/'
    }
  }
  return pathname
}

/** Extract locale prefix from pathname (returns undefined for default locale) */
function extractLocale(pathname: string): string | undefined {
  for (const locale of locales) {
    if (locale === defaultLocale) continue
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale
    }
  }
  return undefined
}

/** Type-specific detail routes that rewrite to /skills/[slug] */
const TYPE_PREFIXES = ['/tools/', '/plugins/', '/mcp-servers/', '/rules/']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const stripped = stripLocale(pathname)

  // Rewrite type-specific detail routes → /[locale]/skills/[slug]
  // e.g. /mcp-servers/foo → /en/skills/foo, /fr/rules/bar → /fr/skills/bar
  const matchedPrefix = TYPE_PREFIXES.find(p => stripped.startsWith(p))
  if (matchedPrefix) {
    const slug = stripped.slice(matchedPrefix.length)
    if (slug && !slug.includes('/')) {
      const locale = extractLocale(pathname) || defaultLocale
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}/skills/${slug}`
      return NextResponse.rewrite(url)
    }
  }

  // Step 1: Run intl middleware for locale detection, redirects, rewrites
  const intlResponse = intlMiddleware(request)

  // Step 2: Run Supabase auth logic
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return intlResponse
  }

  // Preserve intl response headers/cookies while allowing Supabase to add cookies
  let supabaseResponse = intlResponse

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options as any)
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  // Use stripped pathname (without locale prefix) for route matching
  const strippedPath = stripLocale(request.nextUrl.pathname)
  const locale = extractLocale(request.nextUrl.pathname)

  if (!user && PROTECTED_ROUTES.some(r => strippedPath.startsWith(r))) {
    const url = request.nextUrl.clone()
    url.pathname = locale ? `/${locale}/login` : '/login'
    url.searchParams.set('next', strippedPath)
    return NextResponse.redirect(url)
  }

  if (user && AUTH_ROUTES.some(r => strippedPath.startsWith(r))) {
    const url = request.nextUrl.clone()
    url.pathname = locale ? `/${locale}` : '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
