'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Package, Server, Shield, Puzzle, Wrench, FileCode,
  ArrowLeft, ArrowRight, Loader2, Check, Github, FileText,
  Zap, Crown, Clock, CreditCard, Upload, DollarSign,
  ShieldCheck, AlertTriangle, XCircle, RefreshCw,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────

interface Category {
  slug: string
  name: string
}

type ArtifactType = 'skill_pack' | 'mcp_server' | 'ruleset' | 'plugin' | 'extension' | 'tool'
type SourceType = 'github' | 'markdown' | 'upload'
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
    perks: ['Everything in Standard', '48-hour review turnaround', 'Verified badge on your listing'],
    highlight: true,
    accent: 'blue',
  },
  {
    tier: 'featured',
    label: 'Featured',
    regularPrice: 49,
    priceNote: '/mo',
    reviewSla: '24 hours',
    icon: Crown,
    perks: ['24-hour review turnaround', 'Featured on homepage & search results', 'Gold verified badge', 'Top placement in category pages'],
    accent: 'amber',
  },
]

interface LivePrices {
  priority: { amount: number } | null
  featured: { amount: number } | null
}

const PRICE_SUGGESTIONS: Record<string, { min: number; max: number }> = {
  skill_pack: { min: 5, max: 29 },
  ruleset: { min: 5, max: 29 },
  mcp_server: { min: 19, max: 99 },
  plugin: { min: 19, max: 99 },
  extension: { min: 9, max: 49 },
  tool: { min: 9, max: 49 },
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

  // Paid skill state
  const [isPaidSkill, setIsPaidSkill] = useState(false)
  const [skillPrice, setSkillPrice] = useState('')        // dollars for display
  const [uploadedFilePath, setUploadedFilePath] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [uploadProgress, setUploadProgress] = useState(false)

  // Review gate state
  const [reviewing, setReviewing] = useState(false)
  const [reviewResult, setReviewResult] = useState<{
    passed: boolean
    score: number | null
    summary?: string
    strengths?: string[]
    weaknesses?: string[]
    message?: string
    attempt: number
    maxAttempts: number
  } | null>(null)
  const [reviewAttempt, setReviewAttempt] = useState(1)

  const selectedArtifact = ARTIFACT_TYPES.find((a) => a.type === artifactType)

  // Track whether user has GitHub connected
  const [hasGitHub, setHasGitHub] = useState(false)

  // Fetch categories + live Stripe prices on mount, check GitHub connection
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setCategories(data) })
      .catch(() => {})
    fetch('/api/stripe/prices')
      .then((res) => res.json())
      .then((data) => setLivePrices(data))
      .catch(() => {})
    // Check if user has GitHub identity linked
    const supabase = createClient()
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        const identities = data.user?.identities || []
        if (identities.some(i => i.provider === 'github')) {
          setHasGitHub(true)
        }
      })
    }
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
    : sourceType === 'upload'
      ? !!uploadedFilePath
      : markdownContent.trim().length > 20

  const canPassPricing = !isPaidSkill || (parseFloat(skillPrice) >= 1 && parseFloat(skillPrice) <= 999)

  const canSubmit = sourceType === 'github'
    ? githubUrl.trim().length > 5
    : sourceType === 'upload'
      ? !!uploadedFilePath
      : name.trim().length >= 3 && markdownContent.trim().length > 20

  const isTierPaid = reviewTier !== 'standard'
  const skillPriceCents = isPaidSkill ? Math.round(parseFloat(skillPrice || '0') * 100) : 0
  const creatorEarnings = isPaidSkill ? (parseFloat(skillPrice || '0') * 0.85).toFixed(2) : '0'

  // ── Client-side content pre-checks (free, no API tokens) ────

  const getContentPreCheckErrors = (): string[] => {
    const errors: string[] = []
    if (sourceType === 'github') return errors // GitHub content is fetched server-side
    if (sourceType === 'upload') return errors // Can't inspect uploaded files client-side

    const content = markdownContent.trim()
    if (content.length < 100) {
      errors.push('Content is too short (minimum 100 characters). Add more detail to your instructions.')
    }
    if (content.length > 0 && content.length < 300 && !content.includes('#')) {
      errors.push('Add at least one heading (# Section) to structure your content.')
    }
    if (content.length > 0 && !content.includes('\n')) {
      errors.push('Content appears to be a single line. Break it into sections with headings and bullet points.')
    }
    // Check for just a URL pasted
    if (/^https?:\/\/\S+$/.test(content)) {
      errors.push('Content cannot be just a URL. Paste the actual skill instructions or use the GitHub URL option.')
    }
    return errors
  }

  // ── Run Skill Advisor review ────────────────────────────────

  const runReview = async (): Promise<boolean> => {
    // Skip review for GitHub/upload — content is validated server-side during import
    if (sourceType !== 'markdown') return true

    // Client-side pre-checks first (free)
    const preErrors = getContentPreCheckErrors()
    if (preErrors.length > 0) {
      setError(preErrors.join(' '))
      return false
    }

    setReviewing(true)
    setError('')

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: markdownContent,
          artifactType,
          formatStandard,
          attempt: reviewAttempt,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Review failed')
        setReviewing(false)
        return false
      }

      setReviewResult(data)
      setReviewing(false)

      if (!data.passed) {
        setReviewAttempt((a) => a + 1)
        trackEvent('submit_review_rejected', {
          score: data.score,
          attempt: data.attempt,
        })
        return false
      }

      trackEvent('submit_review_passed', {
        score: data.score,
        attempt: data.attempt,
      })
      return true
    } catch {
      setError('Review service unavailable. Please try again.')
      setReviewing(false)
      return false
    }
  }

  // ── Step navigation with GA tracking ────────────────────────

  const goToStep = (nextStep: number) => {
    setError('')

    // Track step transitions
    if (nextStep > step) {
      if (step === 1) {
        trackEvent('submit_step_type', { artifact_type: artifactType })
      } else if (step === 2) {
        trackEvent('submit_step_pricing', {
          is_paid: isPaidSkill,
          price: isPaidSkill ? skillPrice : '0',
        })
      } else if (step === 3) {
        trackEvent('submit_step_content', { source_type: sourceType })
      } else if (step === 4) {
        trackEvent('submit_step_details', {
          has_category: !!categorySlug,
          has_format: !!formatStandard,
        })
      } else if (step === 5) {
        trackEvent('submit_step_tier', { tier: reviewTier })
      }
    }

    setStep(nextStep)
  }

  // ── Submit handler ──────────────────────────────────────────

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')

    // Run Skill Advisor review for markdown submissions (if not already passed)
    if (sourceType === 'markdown' && (!reviewResult || !reviewResult.passed)) {
      const passed = await runReview()
      if (!passed) {
        setSubmitting(false)
        return
      }
    }

    trackEvent('submit_complete', {
      tier: reviewTier,
      artifact_type: artifactType,
      source_type: sourceType,
      is_paid_skill: isPaidSkill,
      skill_price: isPaidSkill ? skillPrice : '0',
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
          isPaid: isPaidSkill,
          priceAmount: isPaidSkill ? skillPriceCents : undefined,
          sourceFilePath: uploadedFilePath || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Submission failed')
        setSubmitting(false)
        return
      }

      // Step 2: If paid tier, redirect to Stripe Checkout
      if (isTierPaid && data.id) {
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

      <p className="mt-5 text-xs text-neutral-400 flex items-center gap-1.5">
        <DollarSign className="w-3.5 h-3.5" />
        You can offer this for free or set a price in the next step.
      </p>
    </div>
  )

  // ── Step 2: Provide Content ──────────────────────────────────

  const renderStep2 = () => (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">Add your content</h2>
      <p className="text-sm text-neutral-500 mb-6">
        {isPaidSkill
          ? 'Upload the files buyers will receive after purchase.'
          : selectedArtifact?.allowMarkdown
            ? 'Choose how you want to provide your content.'
            : 'Provide a GitHub URL to your repository.'}
      </p>

      {/* Source type toggle */}
      <div className="flex flex-wrap gap-2 mb-6">
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
        {selectedArtifact?.allowMarkdown && (
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
        )}
        <button
          onClick={() => setSourceType('upload')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            sourceType === 'upload'
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Upload className="w-4 h-4" /> Upload Files
        </button>
      </div>

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
          {hasGitHub ? (
            <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-xs text-green-700">
                <strong>GitHub connected.</strong> You can import from both public and private repositories.
              </p>
            </div>
          ) : (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
              <div className="flex-1">
                <p className="text-xs text-blue-700">
                  <strong>Private repos supported.</strong> Connect your GitHub account to import from private repositories. Your code stays private — we store a copy for buyers only.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const supabase = createClient()
                  if (!supabase) return
                  supabase.auth.linkIdentity({
                    provider: 'github',
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback?next=/submit`,
                      scopes: 'repo',
                    },
                  })
                }}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                Connect GitHub
              </button>
            </div>
          )}
        </div>
      ) : sourceType === 'upload' ? (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Upload File
          </label>
          {uploadedFilePath ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">{uploadedFileName}</p>
                  <p className="text-xs text-green-600">Uploaded successfully</p>
                </div>
              </div>
              <button
                onClick={() => { setUploadedFilePath(''); setUploadedFileName('') }}
                className="text-xs text-neutral-500 hover:text-neutral-700"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="file"
                accept=".zip,.md,.txt"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setUploadProgress(true)
                  setError('')
                  try {
                    const formData = new FormData()
                    formData.append('file', file)
                    const res = await fetch('/api/upload', { method: 'POST', body: formData })
                    const data = await res.json()
                    if (!res.ok) {
                      setError(data.error || 'Upload failed')
                    } else {
                      setUploadedFilePath(data.storagePath)
                      setUploadedFileName(data.fileName)
                    }
                  } catch {
                    setError('Upload failed. Please try again.')
                  } finally {
                    setUploadProgress(false)
                  }
                }}
                disabled={uploadProgress}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  uploadProgress
                    ? 'border-neutral-300 bg-neutral-50'
                    : 'border-neutral-300 hover:border-neutral-400 bg-white'
                }`}
              >
                {uploadProgress ? (
                  <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                )}
                <p className="text-sm font-medium text-neutral-700">
                  {uploadProgress ? 'Uploading...' : 'Click to upload'}
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  .zip, .md, or .txt — max 50MB
                </p>
              </label>
            </div>
          )}
          <p className="mt-1.5 text-xs text-neutral-400">
            Upload a zip of your project or a single markdown file.
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Markdown Content
          </label>
          <textarea
            value={markdownContent}
            onChange={(e) => { setMarkdownContent(e.target.value); setReviewResult(null) }}
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

  // ── Step 4: Pricing ─────────────────────────────────────────

  const priceSuggestion = PRICE_SUGGESTIONS[artifactType || ''] || { min: 5, max: 49 }

  const renderStep4 = () => (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">Pricing</h2>
      <p className="text-sm text-neutral-500 mb-6">
        Choose whether to offer this for free or charge for access.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setIsPaidSkill(false)}
          className={`p-5 rounded-xl border text-left transition-all ${
            !isPaidSkill
              ? 'border-neutral-900 bg-white ring-1 ring-neutral-900'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              !isPaidSkill ? 'bg-green-100' : 'bg-neutral-100'
            }`}>
              <Check className={`w-4.5 h-4.5 ${!isPaidSkill ? 'text-green-600' : 'text-neutral-500'}`} />
            </div>
            <span className="font-semibold text-neutral-900">Free</span>
          </div>
          <p className="text-xs text-neutral-500">
            Anyone can download and use your skill. Great for building reputation.
          </p>
        </button>

        <button
          onClick={() => setIsPaidSkill(true)}
          className={`p-5 rounded-xl border text-left transition-all ${
            isPaidSkill
              ? 'border-green-500 bg-white ring-1 ring-green-500'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              isPaidSkill ? 'bg-green-100' : 'bg-neutral-100'
            }`}>
              <DollarSign className={`w-4.5 h-4.5 ${isPaidSkill ? 'text-green-600' : 'text-neutral-500'}`} />
            </div>
            <span className="font-semibold text-neutral-900">Paid</span>
          </div>
          <p className="text-xs text-neutral-500">
            Charge for access. You set the price, we handle payments.
          </p>
        </button>
      </div>

      {isPaidSkill && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Price (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
              <input
                type="number"
                min="1"
                max="999"
                step="1"
                value={skillPrice}
                onChange={(e) => setSkillPrice(e.target.value)}
                placeholder={`${priceSuggestion.min}`}
                className="w-full pl-7 pr-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <p className="mt-1.5 text-xs text-neutral-400">
              Suggested range for {selectedArtifact?.name || 'this type'}: ${priceSuggestion.min}–${priceSuggestion.max}
            </p>
          </div>

          {skillPrice && parseFloat(skillPrice) >= 1 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Buyer pays</span>
                <span className="font-semibold text-neutral-900">${parseFloat(skillPrice).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-neutral-600">Platform fee (15%)</span>
                <span className="text-neutral-500">-${(parseFloat(skillPrice) * 0.15).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1 pt-2 border-t border-green-200">
                <span className="font-medium text-green-800">You receive</span>
                <span className="font-bold text-green-800">${creatorEarnings}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  // ── Step 5: Choose Review Tier ────────────────────────────────

  const renderStep5 = () => (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">Choose your review tier</h2>
      <p className="text-sm text-neutral-500 mb-6">
        All submissions get the same quality listing. Paid tiers get faster reviews, badges, and extra visibility on the marketplace.
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

  // ── Step 6: Review & Submit ──────────────────────────────────

  const tierConfig = REVIEW_TIERS.find((t) => t.tier === reviewTier)!

  const renderStep6 = () => (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">Review & Submit</h2>
      <p className="text-sm text-neutral-500 mb-6">
        {isTierPaid
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
            {sourceType === 'github' ? githubUrl : sourceType === 'upload' ? uploadedFileName || 'File upload' : 'Markdown paste'}
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
          <span className="text-xs font-medium text-neutral-500 uppercase">Pricing</span>
          <span className="text-sm font-medium text-neutral-700">
            {isPaidSkill ? `$${parseFloat(skillPrice).toFixed(2)} (you receive $${creatorEarnings})` : 'Free'}
          </span>
        </div>
        <div className="flex items-center justify-between">
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

      {/* Review result feedback */}
      {reviewResult && (
        <div className={`mt-6 p-5 rounded-xl border ${
          reviewResult.passed
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2.5 mb-3">
            {reviewResult.passed ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={`text-sm font-semibold ${
              reviewResult.passed ? 'text-emerald-800' : 'text-red-800'
            }`}>
              {reviewResult.passed
                ? `Quality check passed — ${reviewResult.score?.toFixed(1)}/10`
                : `Quality check failed — ${reviewResult.score?.toFixed(1)}/10 (minimum ${4.0.toFixed(1)} required)`
              }
            </span>
          </div>

          {reviewResult.summary && (
            <p className={`text-sm mb-3 ${reviewResult.passed ? 'text-emerald-700' : 'text-red-700'}`}>
              {reviewResult.summary}
            </p>
          )}

          {((reviewResult.strengths && reviewResult.strengths.length > 0) || (reviewResult.weaknesses && reviewResult.weaknesses.length > 0)) && (
            <ul className="space-y-1.5 mb-3">
              {reviewResult.strengths?.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5 text-sm text-emerald-700">
                  <span className="font-medium mt-0.5 shrink-0">+</span> {s}
                </li>
              ))}
              {reviewResult.weaknesses?.map((w, i) => (
                <li key={`w${i}`} className="flex items-start gap-1.5 text-sm text-red-700">
                  <span className="font-medium mt-0.5 shrink-0">-</span> {w}
                </li>
              ))}
            </ul>
          )}

          {!reviewResult.passed && (
            <div className="pt-3 border-t border-red-200">
              <p className="text-xs text-red-600 mb-3">
                Attempt {reviewResult.attempt} of {reviewResult.maxAttempts}. Go back to the Content step, improve your skill based on the feedback above, then re-submit.
              </p>
              <button
                onClick={() => {
                  setReviewResult(null)
                  setError('')
                  goToStep(3) // back to content step
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Edit Content & Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reviewing spinner */}
      {reviewing && (
        <div className="mt-6 p-5 rounded-xl border bg-blue-50 border-blue-200 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <div>
            <p className="text-sm font-medium text-blue-800">Running quality check...</p>
            <p className="text-xs text-blue-600">The Skill Advisor is reviewing your content. This takes a few seconds.</p>
          </div>
        </div>
      )}

      {!reviewResult && !reviewing && (
        <div className={`mt-6 p-4 rounded-lg border ${
          isTierPaid
            ? 'bg-blue-50 border-blue-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <p className={`text-sm ${isTierPaid ? 'text-blue-800' : 'text-amber-800'}`}>
            {isTierPaid ? (
              <>
                <strong>What happens next?</strong> Your content will be quality-checked by the Skill Advisor, then
                you&apos;ll be redirected to a secure Stripe checkout. After payment, your submission will be queued for{' '}
                {tierConfig.reviewSla.toLowerCase()} review.
              </>
            ) : (
              <>
                <strong>What happens next?</strong> Your content will be quality-checked by the Skill Advisor.
                If it passes (score 4.0+), it will be submitted for admin review. Skills scoring 7.0+ get the Verified badge.
              </>
            )}
          </p>
        </div>
      )}

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
    { num: 2, label: 'Pricing' },
    { num: 3, label: 'Content' },
    { num: 4, label: 'Details' },
    { num: 5, label: 'Tier' },
    { num: 6, label: 'Submit' },
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
        {step === 2 && renderStep4()}
        {step === 3 && renderStep2()}
        {step === 4 && renderStep3()}
        {step === 5 && renderStep5()}
        {step === 6 && renderStep6()}
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

        {step < 6 ? (
          <button
            onClick={() => goToStep(step + 1)}
            disabled={
              (step === 1 && !canGoToStep2) ||
              (step === 2 && !canPassPricing) ||
              (step === 3 && !canGoToStep3)
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
              isTierPaid
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-neutral-900 hover:bg-neutral-800'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {isTierPaid ? 'Processing...' : 'Submitting...'}
              </>
            ) : isTierPaid ? (
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
