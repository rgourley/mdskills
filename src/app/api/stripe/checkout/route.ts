import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/lib/stripe'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'

// 5 checkout attempts per minute per IP
const limiter = createRateLimiter({ windowMs: 60_000, max: 5 })

export async function POST(request: Request) {
  // Rate limit before doing any auth / DB work
  const ip = getClientIp(request)
  if (limiter.check(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { skillId, tier } = body

    if (!skillId || typeof skillId !== 'string') {
      return NextResponse.json({ error: 'skillId is required' }, { status: 400 })
    }

    if (!tier || !['priority', 'featured'].includes(tier)) {
      return NextResponse.json({ error: 'tier must be "priority" or "featured"' }, { status: 400 })
    }

    const result = await createCheckoutSession(skillId, user.id, tier)

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ sessionUrl: result.url })
  } catch (err) {
    // Don't leak internal error details in production
    console.error('Stripe checkout route error:', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
