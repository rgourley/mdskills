import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSignedDownloadUrl } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Auth
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Look up skill
  const { data: skill, error } = await supabase
    .from('skills')
    .select('id, is_paid, source_file_path, submitted_by')
    .eq('slug', slug)
    .or('status.eq.published,status.is.null')
    .single()

  if (error || !skill) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
  }

  if (!skill.is_paid) {
    return NextResponse.json({ error: 'This skill is free — no download required' }, { status: 400 })
  }

  if (!skill.source_file_path) {
    return NextResponse.json({ error: 'No downloadable file available' }, { status: 404 })
  }

  // Check authorization: must be purchaser or creator
  const isCreator = skill.submitted_by === user.id
  let isPurchaser = false

  if (!isCreator) {
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('skill_id', skill.id)
      .single()

    isPurchaser = !!purchase
  }

  if (!isCreator && !isPurchaser) {
    return NextResponse.json({ error: 'Purchase required to download' }, { status: 403 })
  }

  // Generate signed download URL
  const result = await createSignedDownloadUrl(skill.source_file_path, 3600)

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({
    downloadUrl: result.url,
    expiresAt: result.expiresAt,
  })
}
