import { NextResponse } from 'next/server'
import { importSkill } from '@/lib/import-skill'
import { getAdminUser } from '@/lib/admin'

export async function POST(request: Request) {
  const admin = await getAdminUser()
  if (!admin) {
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
