'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Plus, Loader2, Package, Server, Puzzle, Shield, Wrench,
  ExternalLink, Trash2, Pencil, Send, AlertCircle, CheckCircle2, Clock, XCircle, FileText,
  Zap, Crown, CreditCard,
} from 'lucide-react'

interface Submission {
  id: string
  slug: string
  name: string
  description: string
  status: string
  artifactType: string
  formatStandard?: string
  githubUrl?: string
  rejectionReason?: string
  submittedAt?: string
  createdAt: string
  reviewQualityScore?: number
  reviewTier?: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-neutral-100 text-neutral-600', icon: FileText },
  pending_review: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
  in_review: { label: 'In Review', color: 'bg-blue-100 text-blue-700', icon: Clock },
  published: { label: 'Published', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
}

const ARTIFACT_ICONS: Record<string, React.ElementType> = {
  skill_pack: Package,
  mcp_server: Server,
  plugin: Puzzle,
  ruleset: Shield,
  extension: Wrench,
  tool: Wrench,
}

const TIER_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  priority: { label: 'Priority', color: 'bg-blue-100 text-blue-700', icon: Zap },
  featured: { label: 'Featured', color: 'bg-amber-100 text-amber-700', icon: Crown },
}

export function DashboardContent() {
  const searchParams = useSearchParams()
  const justSubmitted = searchParams.get('submitted') === 'true'
  const justPaid = searchParams.get('paid') === 'true'

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(justSubmitted)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(justPaid)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  // Track payment completion with GA Enhanced Ecommerce
  useEffect(() => {
    if (!justPaid || typeof window === 'undefined' || !window.gtag) return
    const sessionId = searchParams.get('session_id')
    if (!sessionId) return

    // Fire basic event immediately
    window.gtag('event', 'submit_payment_complete', { session_id: sessionId })

    // Fetch session details for GA4 ecommerce purchase event
    fetch(`/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!data || data.payment_status !== 'paid') return
        const value = (data.amount_total || 0) / 100

        // GA4 standard purchase event — lights up Monetization reports
        window.gtag?.('event', 'purchase', {
          transaction_id: data.id,
          value,
          currency: (data.currency || 'usd').toUpperCase(),
          items: [
            {
              item_id: data.skillId || 'unknown',
              item_name: `${data.tier || 'paid'}_review`,
              item_category: 'review_tier',
              price: value,
              quantity: 1,
            },
          ],
        })
      })
      .catch(() => { /* best-effort */ })
  }, [justPaid, searchParams])

  useEffect(() => {
    if (showSuccess || showPaymentSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false)
        setShowPaymentSuccess(false)
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess, showPaymentSuccess])

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions')
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitForReview = async (id: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_for_review' }),
      })
      if (res.ok) {
        await fetchSubmissions()
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this draft? This cannot be undone.')) return
    setActionLoading(id)
    try {
      const res = await fetch(`/api/submissions/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id))
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null)
    }
  }

  const getSkillPath = (slug: string, artifactType: string) => {
    const prefixes: Record<string, string> = {
      mcp_server: '/mcp-servers',
      plugin: '/plugins',
      ruleset: '/rules',
      extension: '/tools',
      tool: '/tools',
    }
    return `${prefixes[artifactType] || '/skills'}/${slug}`
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">My Submissions</h1>
            <p className="mt-1 text-neutral-500">Track and manage your submitted listings.</p>
          </div>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Submission
          </Link>
        </div>

        {/* Payment success banner */}
        {showPaymentSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Payment received! Your submission has been queued for priority review.
            </p>
          </div>
        )}

        {/* Success banner */}
        {showSuccess && !showPaymentSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">
              Your listing has been submitted for review. We&apos;ll review it as soon as possible.
            </p>
          </div>
        )}

        {/* Submissions list */}
        {submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.map((sub) => {
              const statusCfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.draft
              const StatusIcon = statusCfg.icon
              const ArtifactIcon = ARTIFACT_ICONS[sub.artifactType] || Package
              const isLoading = actionLoading === sub.id
              const tierCfg = sub.reviewTier && sub.reviewTier !== 'standard' ? TIER_CONFIG[sub.reviewTier] : null
              const TierIcon = tierCfg?.icon
              const isFeatured = sub.reviewTier === 'featured'

              return (
                <div
                  key={sub.id}
                  className={`bg-white border rounded-xl p-5 transition-colors ${
                    isFeatured
                      ? 'border-amber-300 ring-1 ring-amber-200'
                      : 'border-neutral-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <ArtifactIcon className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <h3 className="font-semibold text-neutral-900 truncate">{sub.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${statusCfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                        {tierCfg && TierIcon && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${tierCfg.color}`}>
                            <TierIcon className="w-3 h-3" />
                            {tierCfg.label}
                          </span>
                        )}
                        {sub.reviewQualityScore != null && (
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                            sub.reviewQualityScore >= 7
                              ? 'bg-emerald-100 text-emerald-700'
                              : sub.reviewQualityScore >= 4
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                          }`}>
                            {sub.reviewQualityScore}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-neutral-500 line-clamp-1">{sub.description}</p>

                      {sub.githubUrl && (
                        <a
                          href={sub.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          {sub.githubUrl.replace('https://github.com/', '')}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {/* Rejection reason */}
                      {sub.status === 'rejected' && sub.rejectionReason && (
                        <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                            <span className="text-xs font-medium text-red-700">Rejection Reason</span>
                          </div>
                          <p className="text-sm text-red-600">{sub.rejectionReason}</p>
                        </div>
                      )}

                      <p className="mt-2 text-xs text-neutral-400">
                        Created {new Date(sub.createdAt).toLocaleDateString()}
                        {sub.submittedAt && ` · Submitted ${new Date(sub.submittedAt).toLocaleDateString()}`}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {sub.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleSubmitForReview(sub.id)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {isLoading ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            Submit
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id)}
                            disabled={isLoading}
                            className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Delete draft"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {sub.status === 'rejected' && (
                        <button
                          onClick={() => handleSubmitForReview(sub.id)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Pencil className="w-3 h-3" />
                          )}
                          Resubmit
                        </button>
                      )}
                      {sub.status === 'published' && (
                        <Link
                          href={getSkillPath(sub.slug, sub.artifactType)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" /> View
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900">No submissions yet</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Submit your first skill, MCP server, or plugin to the marketplace.
            </p>
            <Link
              href="/submit"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-4 h-4" /> Submit a Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
