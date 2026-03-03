import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── In-memory rate limiter (per-IP, 30 requests per minute) ──────────
const RATE_LIMIT_WINDOW = 60_000 // 1 minute
const RATE_LIMIT_MAX = 30
const ipHits = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipHits.get(ip)
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT_MAX
}

// Periodically clean stale entries (every 5 min)
setInterval(() => {
  const now = Date.now()
  Array.from(ipHits.entries()).forEach(([ip, entry]) => {
    if (now > entry.resetAt) ipHits.delete(ip)
  })
}, 300_000).unref?.()

// ── Slug validation ──────────────────────────────────────────────────
const SLUG_RE = /^[a-zA-Z0-9_\-/.]+$/

/**
 * POST /api/installs — Track a skill install from the CLI.
 * Fire-and-forget: the CLI doesn't wait for this to succeed.
 * No auth required — anonymous counter increment.
 */
export async function POST(request: NextRequest) {
  // Read env inside the handler (not at module scope)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  // Rate limit by IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: { slug?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const slug = body.slug?.trim()
  if (!slug || slug.length > 200 || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: 'Missing or invalid slug' }, { status: 400 })
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Use Supabase RPC or simple increment — avoid read-then-write race condition
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
