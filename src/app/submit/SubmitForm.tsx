'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Package, Server, Shield, Puzzle, Wrench, FileCode,
  ArrowLeft, ArrowRight, Loader2, Check, Github, FileText,
  Zap, Crown, Clock, CreditCard,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────

interface Category {
  slug: string
  name: string
}

type ArtifactType = 'skill_pack' | 'mcp_server' | 'ruleset' | 'plugin' | 'extension' | 'tool'
type SourceType = 'github' | 'markdown'
type ReviewTier = 'standard' | 'priority' | 'featured'

const ARTIFACT_TYPES: { type: ArtifactType; name: string; description: string; icon: React.ElementType; allowMarkdown: boolean }[] = [
  {
    type: 'skill_pack',
    name: 'Agent Skill',
    description: 'A reusable SKILL.md — the open standard for AI agent capabilities.',
    icon: Package,
    allowMarkdown: true,
  },
  {
    type: 'mcp_server',
    name: 'MCP Server',
    description: 'A Model Context Protocol server that connects AI agents to external tools and APIs.',
    icon: Server,
    allowMarkdown: false,
  },
  {
    type: 'ruleset',
    name: 'Rules / Ruleset',
    description: 'Configuration rules: .cursorrules, CLAUDE.md, AGENTS.md, GEMINI.md, and more.',
    icon: Shield,
    allowMarkdown: true,
  },
  {
    type: 'plugin',
    name: 'Plugin',
    description: 'A Claude Code plugin with commands, hooks, agents, and more.',
    icon: Puzzle,
    allowMarkdown: false,
  },
  {
    type: 'extension',
    name: 'Tool / Extension',
    description: 'A VS Code extension, CLI tool, or developer utility.',
    icon: Wrench,
    allowMarkdown: false,
  },
]

const FORMAT_STANDARDS = [
  { value: 'skill_md', label: 'SKILL.md' },
  { value: 'agents_md', label: 'AGENTS.md' },
  { value: 'claude_md', label: 'CLAUDE.md' },
  { value: 'cursorrules', label: '.cursorrules' },
  { value: 'mdc', label: '.mdc (Cursor rules)' },
  { value: 'copilot_instructions', label: 'copilot-instructions.md' },
  { value: 'gemini_md', label: 'GEMINI.md' },
  { value: 'clinerules', label: '.clinerules' },
  { value: 'windsurf_rules', label: '.windsurfrules' },
  { value: 'generic', label: 'Generic / README' },
]

const REVIEW_TIERS: {
  tier: ReviewTier
  label: string
  regularPrice: number // original price in dollars (0 = free)
  priceNote?: string
  reviewSla: string
  icon: React.ElementType
  perks: string[]
  highlight?: boolean
  accent?: string
}[] = [
  {
    tier: 'standard',
    label: 'Standard',
    regularPrice: 0,
    reviewSla: 'Up to 4 weeks',
    icon: Clock,
    perks: ['Basic listing', 'AI quality review'],
  },
  {
    tier: 'priority',
    label: 'Priority',
    regularPrice: 19,
    priceNote: 'one-time',
    reviewSla: '48 hours',
    icon: Zap,
    perks: ['Everything in Standard', 'Priority review turnaround', 'Priority badge during review'],
    highlight: true,
    accent: 'blue',
  },
  {
    tier: 'featured',
    label: 'Featured',
    regularPrice: 49,
    priceNote: 'per month',
    reviewSla: '24 hours',
    icon: Crown,
    perks: ['Priority review', 'Gold featured badge', 'Priority search placement', 'Homepage spotlight'],
    accent: 'amber',
  },
]

interface LivePrices {
  priority: { amount: number } | null
  featured: { amount: number } | null
}

// ── GA helper ──────────────────────────────────────────────────

function trackEvent(name: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, params)
  }
}

// ── Component ──────────────────────────────────────────────────────

export function SubmitForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  // Form state
  const [artifactType, setArtifactType] = useState<ArtifactType | ''>('')
  const [sourceType, setSourceType] = useState<SourceType>('github')
  const [githubUrl, setGithubUrl] = useState('')
  const [markdownContent, setMarkdownContent] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [formatStandard, setFormatStandard] = useState('')
  const [reviewTier, setReviewTier] = useState<ReviewTier>('standard')
  const [livePrices, setLivePrices] = useState<LivePrices | null>(null)

  const selectedArtifact = ARTIFACT_TYPES.find((a) => a.type === artifactType)

  // Fetch categories + live Stripe prices on mount
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setCategories(data) })
      .catch(() => {})
    fetch('/api/stripe/prices')
      .then((res) => res.json())
      .then((data) => setLivePrices(data))
      .catch(() => {})
  }, [])

  // Helper: get the display price for a tier
  const getLivePrice = (tier: ReviewTier): number | null => {
    if (!livePrices) return null
    if (tier === 'priority') return livePrices.priority?.amount ?? null
    if (tier === 'featured') return livePrices.featured?.amount ?? null
    return null
  }

  // Derived
  const canGoToStep2 = !!artifactType
  const canGoToStep3 = sourceType === 'github'
    ? githubUrl.trim().length > 5
    : markdownContent.trim().length > 20

  const canSubmit = sourceType === 'github'
    ? githubUrl.trim().length > 5
    : name.trim().length >= 3 && markdownContent.trim().length > 20

  const isPaid = reviewTier !== 'standard'

  // ── Step navigation with GA tracking ────────────────────────

  const goToStep = (nextStep: number) => {
    setError('')

    // Track step transitions
    if (nextStep > step) {
      if (step === 1) {
        trackEvent('submit_step_type', { artifact_type: artifactType })
      } else if (step === 2) {
        trackEvent('submit_step_content', { source_type: sourceType })
      } else if (step === 3) {
        trackEvent('submit_step_details', {
          has_category: !!categorySlug,
          has_format: !!formatStandard,
        })
      } else if (step === 4) {
        trackEvent('submit_step_tier', { tier: reviewTier })
      }
    }

    setStep(nextStep)
  }

  // ── Submit handler ──────────────────────────────────────────

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')

    trackEvent('submit_complete', {
      tier: reviewTier,
      artifact_type: artifactType,
      source_type: sourceType,
    })

    try {
      // Step 1: Create the draft
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artifactType,
          sourceType,
          githubUrl: sourceType === 'github' ? githubUrl.trim() : undefined,
          content: sourceType === 'markdown' ? markdownContent : undefined,
          name: name.trim() || undefined,
          description: description.trim() || undefined,
          categorySlug: categorySlug || undefined,
          formatStandard: formatStandard || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Submission failed')
        setSubmitting(false)
        return
      }

      // Step 2: If paid tier, redirect to Stripe Checkout
      if (isPaid && data.id) {
        const tierPrice = getLivePrice(reviewTier) ?? (reviewTier === 'priority' ? 19 : 49)

        trackEvent('submit_payment_start', {
          tier: reviewTier,
          amount: tierPrice,
        })

        // GA4 begin_checkout — standard ecommerce funnel event
        trackEvent('begin_checkout', {
          value: tierPrice,
          currency: 'USD',
          items: [
            {
              item_id: data.id,
              item_name: `${reviewTier}_review`,
              item_category: 'review_tier',
              price: tierPrice,
              quantity: 1,
            },
          ],
        })

        const checkoutRes = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillId: data.id, tier: reviewTier }),
        })

        const checkoutData = await checkoutRes.json()

        if (checkoutRes.ok && checkoutData.sessionUrl) {
          // Redirect to Stripe Checkout
          window.location.href = checkoutData.sessionUrl
          return
        }

        // Stripe checkout failed — show error, don't silently fall back
        setError(checkoutData.error || 'Payment setup failed. Please try again or choose Standard (free).')
        setSubmitting(false)
        return
      }

      // Step 3: Auto-submit for review (free tier or Stripe fallback)
      if (data.id) {
        const reviewRes = await fetch(`/api/submissions/${data.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'submit_for_review' }),
        })
        if (!reviewRes.ok) {
          console.warn('Draft created but auto-submit for review failed')
        }
      }

      // Success — redirect to dashboard
      router.push('/dashboard?submitted=true')
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  // ── Step 1: Choose Type ──────────────────────────────────────

  const renderStep1 = () => (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">What are you submitting?</h2>
      <p className="text-sm text-neutral-500 mb-6">Choose the type of listing you want to add.</p>

      <div className="grid sm:grid-cols-2 gap-3">
        {ARTIFACT_TYPES.map((artifact) => {
          const Icon = artifact.icon
          const selected = artifactType === artifact.type
          return (
            <button
              key={artifact.type}
              onClick={() => {
                setArtifactType(artifact.type)
                // Reset source type if switching to a github-only type
                if (!artifact.allowMarkdown) setSourceType('github')
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                selected
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  selected ? 'bg-blue-100' : 'bg-neutral-100'
                }`}>
                  <Icon className={`w-4.5 h-4.5 ${selected ? 'text-blue-600' : 'text-neutral-500'}`} />
                </div>
                <div>
                  <div className={`font-medium text-sm ${selected ? 'text-blue-900' : 'text-neutral-900'}`}>
                    {artifact.name}
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">{artifact.description}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  // ── Step 2: Provide Content ──────────────────────────────────

  const renderStep2 = () => (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">Add your content</h2>
      <p className="text-sm text-neutral-500 mb-6">
        {selectedArtifact?.allowMarkdown
          ? 'Choose how you want to provide your content.'
          : 'Provide a GitHub URL to your repository.'}
      </p>

      {/* Source type toggle (only for types that allow markdown) */}
      {selectedArtifact?.allowMarkdown && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSourceType('github')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sourceType === 'github'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <Github className="w-4 h-4" /> GitHub URL
          </button>
          <button
            onClick={() => setSourceType('markdown')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sourceType === 'markdown'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Paste Markdown
          </button>
        </div>
      )}

      {sourceType === 'github' ? (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            GitHub URL
          </label>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent font-mono text-sm"
          />
          <p className="mt-1.5 text-xs text-neutral-400">
            Supports full URLs, short form (owner/repo), and tree paths.
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Markdown Content
          </label>
          <textarea
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            placeholder={`---\nname: My Skill\ndescription: A brief description\n---\n\n# Instructions\n\nYour skill instructions here...`}
            rows={14}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent font-mono text-sm resize-y"
          />
          <p className="mt-1.5 text-xs text-neutral-400">
            Paste your SKILL.md, .cursorrules, CLAUDE.md, or other rule file content.
          </p>
        </div>
      )}
    </div>
  )

  // ── Step 3: Details ──────────────────────────────────────────

  const renderStep3 = () => (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">Details</h2>
      <p className="text-sm text-neutral-500 mb-6">
        {sourceType === 'github'
          ? 'Optional — we\'ll auto-detect most of this from your repo.'
          : 'Tell us about your submission.'}
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={sourceType === 'github' ? 'Auto-detected from repo' : 'My awesome skill'}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={sourceType === 'github' ? 'Auto-detected from repo' : 'A brief description of what this does...'}
            rows={3}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="">Auto / None</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          {(artifactType === 'skill_pack' || artifactType === 'ruleset') && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Format</label>
              <select
                value={formatStandard}
                onChange={(e) => setFormatStandard(e.target.value)}
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="">Auto-detect</option>
                {FORMAT_STANDARDS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ── Step 4: Choose Review Tier ────────────────────────────────

  const renderStep4 = () => (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">Choose your review speed</h2>
      <p className="text-sm text-neutral-500 mb-6">
        All submissions get the same quality listing. Paid tiers get faster reviews and extra visibility.
      </p>

      <div className="grid gap-3">
        {REVIEW_TIERS.map((t) => {
          const Icon = t.icon
          const selected = reviewTier === t.tier
          const borderColor = selected
            ? t.accent === 'amber'
              ? 'border-amber-500 ring-1 ring-amber-500'
              : t.accent === 'blue'
                ? 'border-blue-500 ring-1 ring-blue-500'
                : 'border-neutral-900 ring-1 ring-neutral-900'
            : 'border-neutral-200 hover:border-neutral-300'

          // Price logic: compare live Stripe price vs regular price
          const livePrice = getLivePrice(t.tier)
          const isOnSale = livePrice !== null && t.regularPrice > 0 && livePrice < t.regularPrice
          const displayPrice = t.regularPrice === 0
            ? 'Free'
            : livePrice !== null
              ? `$${livePrice % 1 === 0 ? livePrice : livePrice.toFixed(2)}`
              : `$${t.regularPrice}`
          const regularPriceStr = `$${t.regularPrice}`

          return (
            <button
              key={t.tier}
              onClick={() => setReviewTier(t.tier)}
              className={`relative p-5 rounded-xl border text-left transition-all ${borderColor} ${
                selected ? 'bg-white shadow-sm' : 'bg-white'
              }`}
            >
              {isOnSale && (
                <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-green-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                  Sale
                </span>
              )}
              {t.highlight && !isOnSale && (
                <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                  Most Popular
                </span>
              )}
              {t.highlight && isOnSale && (
                <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                  Most Popular
                </span>
              )}

              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selected
                    ? t.accent === 'amber'
                      ? 'bg-amber-100'
                      : t.accent === 'blue'
                        ? 'bg-blue-100'
                        : 'bg-neutral-100'
                    : 'bg-neutral-100'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    selected
                      ? t.accent === 'amber'
                        ? 'text-amber-600'
                        : t.accent === 'blue'
                          ? 'text-blue-600'
                          : 'text-neutral-600'
                      : 'text-neutral-400'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900">{t.label}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        t.tier === 'standard'
                          ? 'bg-neutral-100 text-neutral-600'
                          : t.accent === 'amber'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}>
                        {t.reviewSla} review
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {isOnSale && (
                        <span className="text-sm text-neutral-400 line-through mr-1.5">{regularPriceStr}</span>
                      )}
                      <span className={`text-lg font-bold ${isOnSale ? 'text-green-600' : 'text-neutral-900'}`}>{displayPrice}</span>
                      {t.priceNote && (
                        <span className="text-xs text-neutral-500 ml-1">{t.priceNote}</span>
                      )}
                    </div>
                  </div>

                  <ul className="mt-2 space-y-1">
                    {t.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-2 text-sm text-neutral-600">
                        <Check className={`w-3.5 h-3.5 flex-shrink-0 ${
                          selected ? 'text-green-500' : 'text-neutral-300'
                        }`} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  // ── Step 5: Review & Submit ──────────────────────────────────

  const tierConfig = REVIEW_TIERS.find((t) => t.tier === reviewTier)!

  const renderStep5 = () => (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">Review & Submit</h2>
      <p className="text-sm text-neutral-500 mb-6">
        {isPaid
          ? 'Review your submission, then proceed to payment.'
          : 'Review your submission before sending it for review.'}
      </p>

      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-500 uppercase">Type</span>
          <span className="text-sm font-medium text-neutral-900">{selectedArtifact?.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-500 uppercase">Source</span>
          <span className="text-sm text-neutral-700">
            {sourceType === 'github' ? githubUrl : 'Markdown paste'}
          </span>
        </div>
        {name && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase">Name</span>
            <span className="text-sm text-neutral-700">{name}</span>
          </div>
        )}
        {categorySlug && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase">Category</span>
            <span className="text-sm text-neutral-700">
              {categories.find((c) => c.slug === categorySlug)?.name || categorySlug}
            </span>
          </div>
        )}
        {formatStandard && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase">Format</span>
            <span className="text-sm text-neutral-700">
              {FORMAT_STANDARDS.find((f) => f.value === formatStandard)?.label || formatStandard}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
          <span className="text-xs font-medium text-neutral-500 uppercase">Review Tier</span>
          <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${
            reviewTier === 'featured'
              ? 'text-amber-700'
              : reviewTier === 'priority'
                ? 'text-blue-700'
                : 'text-neutral-700'
          }`}>
            {tierConfig.label} — {(() => {
              const live = getLivePrice(reviewTier)
              const onSale = live !== null && tierConfig.regularPrice > 0 && live < tierConfig.regularPrice
              const price = tierConfig.regularPrice === 0
                ? 'Free'
                : live !== null
                  ? `$${live % 1 === 0 ? live : live.toFixed(2)}`
                  : `$${tierConfig.regularPrice}`
              return onSale ? (
                <><span className="line-through text-neutral-400 mr-1">${tierConfig.regularPrice}</span>{price}</>
              ) : price
            })()}
            {tierConfig.priceNote ? ` (${tierConfig.priceNote})` : ''}
          </span>
        </div>
      </div>

      <div className={`mt-6 p-4 rounded-lg border ${
        isPaid
          ? 'bg-blue-50 border-blue-200'
          : 'bg-amber-50 border-amber-200'
      }`}>
        <p className={`text-sm ${isPaid ? 'text-blue-800' : 'text-amber-800'}`}>
          {isPaid ? (
            <>
              <strong>What happens next?</strong> Your listing will be created and you&apos;ll be redirected to
              a secure Stripe checkout. After payment, your submission will automatically be queued for{' '}
              {tierConfig.reviewSla.toLowerCase()} review.
            </>
          ) : (
            <>
              <strong>What happens next?</strong> Your listing will be created as a draft and automatically submitted for review.
              An admin will review it and either approve or request changes. Standard reviews take up to 4 weeks.
            </>
          )}
        </p>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )

  // ── Stepper ──────────────────────────────────────────────────

  const steps = [
    { num: 1, label: 'Type' },
    { num: 2, label: 'Content' },
    { num: 3, label: 'Details' },
    { num: 4, label: 'Tier' },
    { num: 5, label: 'Submit' },
  ]

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              step === s.num
                ? 'bg-neutral-900 text-white'
                : step > s.num
                  ? 'bg-green-100 text-green-700'
                  : 'bg-neutral-100 text-neutral-400'
            }`}>
              {step > s.num ? <Check className="w-3 h-3" /> : <span>{s.num}</span>}
              <span>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-px mx-1 ${step > s.num ? 'bg-green-300' : 'bg-neutral-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => goToStep(step - 1)}
          disabled={step === 1}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 disabled:opacity-0 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {step < 5 ? (
          <button
            onClick={() => goToStep(step + 1)}
            disabled={
              (step === 1 && !canGoToStep2) ||
              (step === 2 && !canGoToStep3)
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isPaid
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-neutral-900 hover:bg-neutral-800'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {isPaid ? 'Processing...' : 'Submitting...'}
              </>
            ) : isPaid ? (
              <>
                <CreditCard className="w-4 h-4" /> Pay & Submit — {(() => {
                  const live = getLivePrice(reviewTier)
                  return live !== null
                    ? `$${live % 1 === 0 ? live : live.toFixed(2)}`
                    : `$${tierConfig.regularPrice}`
                })()}
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> Submit for Review
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
