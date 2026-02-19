import { NextRequest, NextResponse } from 'next/server'
import { importSkill } from '@/lib/import-skill'

/** Simple admin auth check using the service role key as the secret */
function isAuthorized(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!adminKey) return false

  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${adminKey}`) return true

  // Also check cookie for browser-based admin UI
  const cookie = request.cookies.get('admin_token')
  if (cookie?.value === adminKey) return true

  return false
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { url, slug, name, category, platforms, artifactType, formatStandard, dryRun } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid GitHub URL' }, { status: 400 })
    }

    const result = await importSkill({
      url,
      slug: slug || undefined,
      name: name || undefined,
      category: category || undefined,
      platforms: platforms ? (Array.isArray(platforms) ? platforms : platforms.split(',').map((s: string) => s.trim())) : undefined,
      artifactType: artifactType || undefined,
      formatStandard: formatStandard || undefined,
      dryRun: dryRun || false,
    })

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error', logs: [] },
      { status: 500 }
    )
  }
}
