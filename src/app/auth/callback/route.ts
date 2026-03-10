import { createClient } from '@/lib/supabase/server'
import { storeGitHubToken } from '@/lib/github-token'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  try {
    if (code) {
      const supabase = await createClient()
      if (supabase) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data.session) {
          // Capture GitHub provider token for private repo access
          // This is the only moment the provider_token is available
          if (data.session.provider_token && data.session.user?.app_metadata?.provider === 'github') {
            try {
              await storeGitHubToken(data.session.user.id, data.session.provider_token)
            } catch (e) {
              console.error('Failed to store GitHub token:', e)
            }
          }
          return NextResponse.redirect(`${origin}${next}`)
        }
        console.error('Auth callback error:', error?.message)
      }
    }
  } catch (e) {
    console.error('Auth callback exception:', e)
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
