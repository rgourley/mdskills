/**
 * Stripe integration for paid review tiers.
 *
 * Tiers:
 * - standard (free, up to 4 weeks review)
 * - priority ($19 one-time, 48h review)
 * - featured ($49/mo, 24h review + featured badge + priority placement)
 */
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// ── Stripe client ────────────────────────────────────────────────

let _stripe: Stripe | null = null

export function getStripeClient(): Stripe | null {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  _stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' as any })
  return _stripe
}

// ── Helpers ──────────────────────────────────────────────────────

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3002'
}

// ── Checkout session ─────────────────────────────────────────────

export type ReviewTier = 'standard' | 'priority' | 'featured'

export const TIER_CONFIG: Record<ReviewTier, {
  label: string
  price: string
  priceAmount: number
  reviewSla: string
  perks: string[]
  mode: 'payment' | 'subscription'
}> = {
  standard: {
    label: 'Standard',
    price: 'Free',
    priceAmount: 0,
    reviewSla: 'Up to 4 weeks',
    perks: ['Basic listing', 'AI quality review'],
    mode: 'payment',
  },
  priority: {
    label: 'Priority',
    price: '$19',
    priceAmount: 1900,
    reviewSla: '48 hours',
    perks: ['Everything in Standard', 'Priority review turnaround', 'Priority badge during review'],
    mode: 'payment',
  },
  featured: {
    label: 'Featured',
    price: '$49/mo',
    priceAmount: 4900,
    reviewSla: '24 hours',
    perks: ['Priority review', 'Gold featured badge', 'Priority search placement', 'Homepage spotlight'],
    mode: 'subscription',
  },
}

export async function createCheckoutSession(
  skillId: string,
  userId: string,
  tier: 'priority' | 'featured'
): Promise<{ url: string } | { error: string }> {
  const stripe = getStripeClient()
  if (!stripe) return { error: 'Stripe not configured' }

  const priceId = tier === 'priority'
    ? process.env.STRIPE_PRIORITY_PRICE_ID
    : process.env.STRIPE_FEATURED_PRICE_ID

  if (!priceId) return { error: `No Stripe price ID configured for ${tier} tier` }

  const baseUrl = getBaseUrl()
  const mode = TIER_CONFIG[tier].mode

  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { skillId, userId, tier },
      success_url: `${baseUrl}/dashboard?paid=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/submit?step=4`,
      client_reference_id: userId,
    })

    if (!session.url) return { error: 'Failed to create checkout session' }
    return { url: session.url }
  } catch (err: any) {
    console.error('Stripe checkout error:', err.message, err.type, err.code)
    return { error: err.message || 'Stripe error' }
  }
}

// ── Purchase checkout (paid skill downloads) ────────────────────

const PLATFORM_FEE_PERCENT = 15

export async function createPurchaseCheckoutSession(
  skillId: string,
  skillName: string,
  skillSlug: string,
  buyerUserId: string,
  priceAmountCents: number,
  priceCurrency: string = 'usd'
): Promise<{ url: string } | { error: string }> {
  const stripe = getStripeClient()
  if (!stripe) return { error: 'Stripe not configured' }

  const baseUrl = getBaseUrl()
  const platformFeeCents = Math.round(priceAmountCents * PLATFORM_FEE_PERCENT / 100)

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: priceCurrency,
            product_data: {
              name: skillName,
              description: `One-time purchase — download access to "${skillName}"`,
            },
            unit_amount: priceAmountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'skill_purchase',
        skillId,
        skillSlug,
        buyerUserId,
        platformFeeCents: String(platformFeeCents),
        amountCents: String(priceAmountCents),
      },
      success_url: `${baseUrl}/skills/${skillSlug}?purchased=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/skills/${skillSlug}`,
      client_reference_id: buyerUserId,
    })

    if (!session.url) return { error: 'Failed to create checkout session' }
    return { url: session.url }
  } catch (err: any) {
    console.error('Stripe purchase checkout error:', err.message)
    return { error: err.message || 'Stripe error' }
  }
}

// ── Webhook handler ──────────────────────────────────────────────

export async function handleWebhookEvent(event: Stripe.Event): Promise<{ ok: boolean; error?: string }> {
  const supabase = getServiceClient()
  if (!supabase) return { ok: false, error: 'Database unavailable' }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const metadata = session.metadata || {}

      // ── Skill purchase checkout ──
      if (metadata.type === 'skill_purchase') {
        const { skillId, buyerUserId, platformFeeCents, amountCents } = metadata
        if (!skillId || !buyerUserId) {
          return { ok: false, error: 'Missing metadata on purchase session' }
        }

        // Upsert purchase record
        const { error: purchaseError } = await supabase
          .from('purchases')
          .upsert(
            {
              user_id: buyerUserId,
              skill_id: skillId,
              amount: parseInt(amountCents || '0', 10),
              currency: 'usd',
              platform_fee: parseInt(platformFeeCents || '0', 10),
              stripe_session_id: session.id,
              stripe_payment_intent_id: typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id || null,
            },
            { onConflict: 'user_id,skill_id' }
          )

        if (purchaseError) {
          return { ok: false, error: `Purchase record error: ${purchaseError.message}` }
        }
        return { ok: true }
      }

      // ── Review tier checkout (existing logic) ──
      const { skillId, userId, tier } = metadata
      if (!skillId || !tier) {
        return { ok: false, error: 'Missing metadata on checkout session' }
      }

      const updates: Record<string, any> = {
        review_tier: tier,
        stripe_payment_id: session.id,
      }

      // For featured tier, set featured flag + expiration
      if (tier === 'featured') {
        updates.featured = true
        // Set featured_until to 30 days from now (will be extended by subscription renewals)
        const featuredUntil = new Date()
        featuredUntil.setDate(featuredUntil.getDate() + 30)
        updates.featured_until = featuredUntil.toISOString()
      }

      // Update skill with tier info
      const { error: updateError } = await supabase
        .from('skills')
        .update(updates)
        .eq('id', skillId)

      if (updateError) {
        return { ok: false, error: updateError.message }
      }

      // Auto-submit for review
      const { data: skill } = await supabase
        .from('skills')
        .select('status, submitted_by')
        .eq('id', skillId)
        .single()

      if (skill && skill.status === 'draft') {
        await supabase
          .from('skills')
          .update({
            status: 'pending_review',
            submitted_at: new Date().toISOString(),
          })
          .eq('id', skillId)
      }

      return { ok: true }
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      // Find the skill by stripe_payment_id (the checkout session ID)
      // The checkout session metadata contained the skillId — but subscription events don't carry it.
      // We need to look up via the checkout session that created this subscription.
      const stripe = getStripeClient()
      if (!stripe) return { ok: false, error: 'Stripe not configured' }

      // Find the latest invoice for this subscription to get the checkout session
      const sessions = await stripe.checkout.sessions.list({
        subscription: subscription.id,
        limit: 1,
      })

      const session = sessions.data[0]
      if (!session?.metadata?.skillId) {
        return { ok: false, error: 'Could not find skill for cancelled subscription' }
      }

      const { error } = await supabase
        .from('skills')
        .update({
          featured: false,
          featured_until: null,
          review_tier: 'standard',
        })
        .eq('id', session.metadata.skillId)

      if (error) return { ok: false, error: error.message }
      return { ok: true }
    }

    default:
      return { ok: true }
  }
}
