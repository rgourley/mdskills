import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * POST /api/installs — Track a skill install from the CLI.
 * Fire-and-forget: the CLI doesn't wait for this to succeed.
 * No auth required — anonymous counter increment.
 */
export async function POST(request: NextRequest) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  let body: { slug?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const slug = body.slug?.trim()
  if (!slug || slug.length > 200) {
    return NextResponse.json({ error: 'Missing or invalid slug' }, { status: 400 })
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Get current count and increment
    const { data, error: fetchError } = await supabase
      .from('skills')
      .select('weekly_installs')
      .eq('slug', slug)
      .single()

    if (fetchError || !data) {
      return NextResponse.json({ ok: true }) // Skill not found — silently ignore
    }

    const newCount = (data.weekly_installs ?? 0) + 1

    await supabase
      .from('skills')
      .update({ weekly_installs: newCount })
      .eq('slug', slug)

    return NextResponse.json({ ok: true })
  } catch {
    // Best-effort — never fail the CLI install
    return NextResponse.json({ ok: true })
  }
}
