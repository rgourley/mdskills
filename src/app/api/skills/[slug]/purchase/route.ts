import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPurchaseCheckoutSession } from '@/lib/stripe'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'

const limiter = createRateLimiter({ windowMs: 60_000, max: 5 })

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Rate limit
  const ip = getClientIp(request)
  if (limiter.check(ip)) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
  }

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
    .select('id, name, slug, is_paid, price_amount, price_currency, submitted_by')
    .eq('slug', slug)
    .or('status.eq.published,status.is.null')
    .single()

  if (error || !skill) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
  }

  if (!skill.is_paid || !skill.price_amount) {
    return NextResponse.json({ error: 'This skill is not available for purchase' }, { status: 400 })
  }

  // Prevent self-purchase
  if (skill.submitted_by === user.id) {
    return NextResponse.json({ error: 'You cannot purchase your own skill' }, { status: 400 })
  }

  // Check if already purchased
  const { data: existingPurchase } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('skill_id', skill.id)
    .single()

  if (existingPurchase) {
    return NextResponse.json({ error: 'You already own this skill' }, { status: 400 })
  }

  // Create Stripe checkout session
  const result = await createPurchaseCheckoutSession(
    skill.id,
    skill.name,
    skill.slug,
    user.id,
    skill.price_amount,
    skill.price_currency || 'usd'
  )

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ sessionUrl: result.url })
}
