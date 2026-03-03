import { NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripe'

export async function GET() {
  const stripe = getStripeClient()
  if (!stripe) {
    return NextResponse.json({ priority: null, featured: null })
  }

  try {
    const [priorityId, featuredId] = [
      process.env.STRIPE_PRIORITY_PRICE_ID,
      process.env.STRIPE_FEATURED_PRICE_ID,
    ]

    const [priority, featured] = await Promise.all([
      priorityId ? stripe.prices.retrieve(priorityId) : null,
      featuredId ? stripe.prices.retrieve(featuredId) : null,
    ])

    return NextResponse.json({
      priority: priority ? {
        amount: priority.unit_amount! / 100,
        currency: priority.currency,
      } : null,
      featured: featured ? {
        amount: featured.unit_amount! / 100,
        currency: featured.currency,
      } : null,
    })
  } catch {
    return NextResponse.json({ priority: null, featured: null })
  }
}
