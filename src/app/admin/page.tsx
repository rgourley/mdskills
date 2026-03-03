'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2, Plus, Check, AlertCircle, ExternalLink, Trash2, ShieldAlert,
  Clock, CheckCircle2, XCircle, Package, Server, Puzzle, Shield, Wrench,
  Eye, ChevronDown, Zap, Crown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ── Types ──────────────────────────────────────────────────────

interface ImportResult {
  success: boolean
  slug?: string
  name?: string
  id?: string
  error?: string
  logs: string[]
}

interface Category {
  slug: string
  name: string
}

interface QueueItem {
  id: string
  url: string
  status: 'pending' | 'importing' | 'done' | 'error'
  result?: ImportResult
  artifactType?: string
  formatStandard?: string
  category?: string
  slug?: string
  name?: string
}

interface ReviewItem {
  id: string
  slug: string
  name: string
  description: string
  status: string
  artifactType: string
  content?: string
  githubUrl?: string
  submittedAt?: string
  createdAt: string
  submitterEmail?: string
  submitterName?: string
  reviewQualityScore?: number
  reviewTier?: string
}

const TIER_BADGE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  priority: { label: 'Priority', color: 'bg-blue-100 text-blue-700', icon: Zap },
  featured: { label: 'Featured', color: 'bg-amber-100 text-amber-700', icon: Crown },
}

// ── Constants ──────────────────────────────────────────────────

const ARTIFACT_TYPES = [
  { value: '', label: 'Auto-detect' },
  { value: 'skill_pack', label: 'Agent Skill' },
  { value: 'mcp_server', label: 'MCP Server' },
  { value: 'workflow_pack', label: 'Workflow' },
  { value: 'ruleset', label: 'Rules' },
  { value: 'template_bundle', label: 'Starter Kit' },
  { value: 'openapi_action', label: 'OpenAPI Action' },
  { value: 'extension', label: 'Extension' },
  { value: 'tool', label: 'Tool' },
  { value: 'plugin', label: 'Plugin' },
]

const FORMAT_STANDARDS = [
  { value: '', label: 'Auto-detect' },
  { value: 'skill_md', label: 'SKILL.md' },
  { value: 'agents_md', label: 'AGENTS.md' },
  { value: 'claude_md', label: 'CLAUDE.md' },
  { value: 'cursorrules', label: '.cursorrules' },
  { value: 'mdc', label: '.mdc (Cursor rules)' },
  { value: 'copilot_instructions', label: 'copilot-instructions.md' },
  { value: 'gemini_md', label: 'GEMINI.md' },
  { value: 'clinerules', label: '.clinerules' },
  { value: 'windsurf_rules', label: '.windsurfrules' },
  { value: 'generic', label: 'Generic (README)' },
]

const ARTIFACT_ICONS: Record<string, React.ElementType> = {
  skill_pack: Package,
  mcp_server: Server,
  plugin: Puzzle,
  ruleset: Shield,
  extension: Wrench,
  tool: Wrench,
  workflow_pack: Package,
}

// ── Main Component ──────────────────────────────────────────────

export default function AdminPage() {
  const [authState, setAuthState] = useState<'loading' | 'not_signed_in' | 'not_admin' | 'admin'>('loading')
  const [activeTab, setActiveTab] = useState<'import' | 'review'>('import')
  const router = useRouter()

  // Import form state
  const [urlInput, setUrlInput] = useState('')
  const [artifactType, setArtifactType] = useState('')
  const [formatStandard, setFormatStandard] = useState('')
  const [category, setCategory] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [customName, setCustomName] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [processing, setProcessing] = useState(false)

  // Review queue state
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([])
  const [reviewLoading, setReviewLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({})
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      if (!supabase) { setAuthState('not_signed_in'); return }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAuthState('not_signed_in'); return }

      const res = await fetch('/api/admin/auth')
      if (res.ok) {
        setAuthState('admin')
        const catRes = await fetch('/api/admin/categories')
        if (catRes.ok) setCategories(await catRes.json())
      } else {
        setAuthState('not_admin')
      }
    }
    checkAuth()
  }, [])

  // Fetch review queue when switching to review tab
  useEffect(() => {
    if (activeTab === 'review' && authState === 'admin') {
      fetchReviewQueue()
    }
  }, [activeTab, authState])

  const fetchReviewQueue = async () => {
    setReviewLoading(true)
    try {
      const res = await fetch('/api/admin/review-queue')
      if (res.ok) {
        const data = await res.json()
        setReviewQueue(data)
      }
    } catch {
      // ignore
    } finally {
      setReviewLoading(false)
    }
  }

  // ── Import handlers ──────────────────────────────────────────

  const addToQueue = () => {
    const urls = urlInput
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && (u.includes('github.com') || u.match(/^[\w-]+\/[\w-]+$/)))

    if (urls.length === 0) return

    const newItems: QueueItem[] = urls.map((url) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      url,
      status: 'pending',
      artifactType: artifactType || undefined,
      formatStandard: formatStandard || undefined,
      category: category || undefined,
      slug: customSlug || undefined,
      name: customName || undefined,
    }))

    setQueue((prev) => [...prev, ...newItems])
    setUrlInput('')
    setCustomSlug('')
    setCustomName('')
  }

  const removeFromQueue = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id))
  }

  const processQueue = useCallback(async () => {
    setProcessing(true)
    const pending = queue.filter((item) => item.status === 'pending')

    for (const item of pending) {
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'importing' } : q))
      )

      try {
        const res = await fetch('/api/admin/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: item.url,
            artifactType: item.artifactType,
            formatStandard: item.formatStandard,
            category: item.category,
            slug: item.slug,
            name: item.name,
          }),
        })

        const result: ImportResult = await res.json()

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: result.success ? 'done' : 'error', result }
              : q
          )
        )
      } catch (err) {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  status: 'error',
                  result: { success: false, error: 'Network error', logs: [] },
                }
              : q
          )
        )
      }
    }

    setProcessing(false)
  }, [queue])

  // ── Review handlers ──────────────────────────────────────────

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/review/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })
      if (res.ok) {
        setReviewQueue((prev) => prev.filter((item) => item.id !== id))
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    const reason = rejectionReasons[id]
    if (!reason || reason.trim().length < 5) {
      alert('Please provide a rejection reason (at least 5 characters)')
      return
    }
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/review/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', rejectionReason: reason.trim() }),
      })
      if (res.ok) {
        setReviewQueue((prev) => prev.filter((item) => item.id !== id))
        setRejectionReasons((prev) => { const next = { ...prev }; delete next[id]; return next })
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null)
    }
  }

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── Auth guards ──────────────────────────────────────────────

  if (authState === 'loading') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (authState === 'not_signed_in') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShieldAlert className="w-10 h-10 text-neutral-300 mx-auto" />
          <h1 className="text-xl font-bold text-neutral-900">Admin Access</h1>
          <p className="text-sm text-neutral-500">You need to sign in to access the admin panel.</p>
          <button
            onClick={() => router.push('/login?next=/admin')}
            className="px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    )
  }

  if (authState === 'not_admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShieldAlert className="w-10 h-10 text-red-300 mx-auto" />
          <h1 className="text-xl font-bold text-neutral-900">Access Denied</h1>
          <p className="text-sm text-neutral-500">Your account does not have admin privileges.</p>
        </div>
      </div>
    )
  }

  const pendingCount = queue.filter((q) => q.status === 'pending').length
  const doneCount = queue.filter((q) => q.status === 'done').length
  const errorCount = queue.filter((q) => q.status === 'error').length

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Admin</h1>
          <p className="mt-1 text-neutral-500">Import skills and review user submissions.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'import'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Import
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'review'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Review Queue
          {reviewQueue.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
              {reviewQueue.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Import Tab ────────────────────────────────────────── */}
      {activeTab === 'import' && (
        <>
          <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  GitHub URLs
                </label>
                <textarea
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={`https://github.com/owner/repo\nhttps://github.com/another/repo\nowner/repo`}
                  rows={3}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent font-mono text-sm resize-none"
                />
                <p className="mt-1 text-xs text-neutral-400">
                  One URL per line. Supports full URLs, short form (owner/repo), and tree paths.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Type</label>
                  <select
                    value={artifactType}
                    onChange={(e) => setArtifactType(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    {ARTIFACT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Format</label>
                  <select
                    value={formatStandard}
                    onChange={(e) => setFormatStandard(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    {FORMAT_STANDARDS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    <option value="">Auto / None</option>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Custom Slug</label>
                  <input
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    placeholder="auto"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Custom Name</label>
                  <input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="auto"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={addToQueue}
                  disabled={!urlInput.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" /> Add to Queue
                </button>
                {pendingCount > 0 && (
                  <button
                    onClick={processQueue}
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</>
                    ) : (
                      <>Import All ({pendingCount})</>
                    )}
                  </button>
                )}
                {queue.length > 0 && (
                  <span className="text-sm text-neutral-400">
                    {doneCount} done{errorCount > 0 ? `, ${errorCount} failed` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Import Queue */}
          {queue.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-neutral-700">Import Queue</h2>
              {queue.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-xl p-4 transition-colors ${
                    item.status === 'done'
                      ? 'border-green-200 bg-green-50/50'
                      : item.status === 'error'
                        ? 'border-red-200 bg-red-50/50'
                        : item.status === 'importing'
                          ? 'border-blue-200 bg-blue-50/50'
                          : 'border-neutral-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {item.status === 'importing' && <Loader2 className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />}
                        {item.status === 'done' && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
                        {item.status === 'error' && <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
                        <code className="text-sm font-mono text-neutral-800 truncate">{item.url}</code>
                      </div>
                      {item.result && item.status === 'done' && (
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-sm font-medium text-green-700">{item.result.name}</span>
                          <a href={`/skills/${item.result.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      {item.result && item.status === 'error' && (
                        <p className="mt-1 text-sm text-red-600">{item.result.error}</p>
                      )}
                      {item.result && item.result.logs.length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-neutral-400 cursor-pointer hover:text-neutral-600">
                            Show logs ({item.result.logs.length})
                          </summary>
                          <pre className="mt-1 text-xs text-neutral-500 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto bg-neutral-50 rounded-lg p-3">
                            {item.result.logs.join('\n')}
                          </pre>
                        </details>
                      )}
                    </div>
                    {item.status !== 'importing' && (
                      <button onClick={() => removeFromQueue(item.id)} className="text-neutral-400 hover:text-red-500 transition-colors p-1" title="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {queue.length === 0 && (
            <div className="text-center py-16 text-neutral-400">
              <p className="text-lg">No imports queued</p>
              <p className="mt-1 text-sm">Paste GitHub URLs above and click &ldquo;Add to Queue&rdquo;</p>
            </div>
          )}
        </>
      )}

      {/* ── Review Queue Tab ────────────────────────────────── */}
      {activeTab === 'review' && (
        <>
          {reviewLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
            </div>
          ) : reviewQueue.length === 0 ? (
            <div className="text-center py-20 text-neutral-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-200" />
              <p className="text-lg font-medium text-neutral-600">All caught up!</p>
              <p className="mt-1 text-sm">No submissions pending review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-neutral-500">
                {reviewQueue.length} {reviewQueue.length === 1 ? 'submission' : 'submissions'} pending review
              </p>

              {reviewQueue.map((item) => {
                const ArtifactIcon = ARTIFACT_ICONS[item.artifactType] || Package
                const isExpanded = expandedItems.has(item.id)
                const isLoading = actionLoading === item.id
                const tierBadge = item.reviewTier && item.reviewTier !== 'standard' ? TIER_BADGE_CONFIG[item.reviewTier] : null
                const TierBadgeIcon = tierBadge?.icon
                const isFeatured = item.reviewTier === 'featured'

                return (
                  <div key={item.id} className={`bg-white border rounded-xl overflow-hidden ${
                    isFeatured
                      ? 'border-amber-300 ring-1 ring-amber-200'
                      : item.reviewTier === 'priority'
                        ? 'border-blue-200'
                        : 'border-neutral-200'
                  }`}>
                    {/* Header */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <ArtifactIcon className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                            <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700">
                              <Clock className="w-3 h-3" />
                              {item.status === 'in_review' ? 'In Review' : 'Pending'}
                            </span>
                            {tierBadge && TierBadgeIcon && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${tierBadge.color}`}>
                                <TierBadgeIcon className="w-3 h-3" />
                                {tierBadge.label}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{item.description}</p>

                          <div className="mt-2 flex items-center gap-4 text-xs text-neutral-400">
                            <span>
                              By {item.submitterName || item.submitterEmail || 'Unknown'}
                            </span>
                            {item.submittedAt && (
                              <span>Submitted {new Date(item.submittedAt).toLocaleDateString()}</span>
                            )}
                            {item.githubUrl && (
                              <a
                                href={item.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                              >
                                {item.githubUrl.replace('https://github.com/', '')}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Expand/collapse */}
                        <button
                          onClick={() => toggleExpanded(item.id)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                          <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="border-t border-neutral-100">
                        {/* Content preview */}
                        {item.content && (
                          <div className="p-5 border-b border-neutral-100">
                            <h4 className="text-xs font-medium text-neutral-500 uppercase mb-2">Content Preview</h4>
                            <pre className="text-xs text-neutral-600 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto bg-neutral-50 rounded-lg p-4">
                              {item.content.slice(0, 3000)}
                              {(item.content?.length || 0) > 3000 && '\n\n... (truncated)'}
                            </pre>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="p-5 bg-neutral-50 space-y-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleApprove(item.id)}
                              disabled={isLoading}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              Approve & Publish
                            </button>
                          </div>

                          <div>
                            <textarea
                              value={rejectionReasons[item.id] || ''}
                              onChange={(e) => setRejectionReasons((prev) => ({ ...prev, [item.id]: e.target.value }))}
                              placeholder="Rejection reason (required if rejecting)..."
                              rows={2}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                            />
                            <button
                              onClick={() => handleReject(item.id)}
                              disabled={isLoading}
                              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
