import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripeClient } from '@/lib/stripe'

/**
 * GET /api/stripe/session?session_id=cs_xxx
 * Returns Stripe checkout session details for GA ecommerce tracking.
 * Auth-protected: only the user who made the purchase can retrieve it.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sessionId = request.nextUrl.searchParams.get('session_id')
  if (!sessionId || !sessionId.startsWith('cs_')) {
    return NextResponse.json({ error: 'Invalid session_id' }, { status: 400 })
  }

  const stripe = getStripeClient()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Only allow the user who created this session to view it
    if (session.client_reference_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      id: session.id,
      amount_total: session.amount_total, // in cents
      currency: session.currency,
      payment_status: session.payment_status,
      tier: session.metadata?.tier || null,
      skillId: session.metadata?.skillId || null,
    })
  } catch (err) {
    console.error('Stripe session retrieval error:', err)
    return NextResponse.json({ error: 'Failed to retrieve session' }, { status: 500 })
  }
}
