'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Check, AlertCircle, ExternalLink, Trash2, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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

const ARTIFACT_TYPES = [
  { value: '', label: 'Auto-detect' },
  { value: 'skill_pack', label: 'Agent Skill' },
  { value: 'mcp_server', label: 'MCP Server' },
  { value: 'workflow_pack', label: 'Workflow' },
  { value: 'ruleset', label: 'Rules' },
  { value: 'template_bundle', label: 'Starter Kit' },
  { value: 'openapi_action', label: 'OpenAPI Action' },
  { value: 'extension', label: 'Extension' },
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

export default function AdminPage() {
  const [authState, setAuthState] = useState<'loading' | 'not_signed_in' | 'not_admin' | 'admin'>('loading')
  const router = useRouter()

  // Import form
  const [urlInput, setUrlInput] = useState('')
  const [artifactType, setArtifactType] = useState('')
  const [formatStandard, setFormatStandard] = useState('')
  const [category, setCategory] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [customName, setCustomName] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  // Queue
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [processing, setProcessing] = useState(false)

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      if (!supabase) { setAuthState('not_signed_in'); return }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAuthState('not_signed_in'); return }

      // Check admin via API
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

  // Loading
  if (authState === 'loading') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  // Not signed in
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

  // Signed in but not admin
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Import Skills</h1>
          <p className="mt-1 text-neutral-500">
            Paste GitHub URLs to import skills, MCP servers, and more.
          </p>
        </div>
      </div>

      {/* Import Form */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-8">
        <div className="space-y-4">
          {/* URL Input */}
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

          {/* Options row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Type</label>
              <select
                value={artifactType}
                onChange={(e) => setArtifactType(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {ARTIFACT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
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
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
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
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Custom Slug
              </label>
              <input
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="auto"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Custom Name
              </label>
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="auto"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Add button */}
          <div className="flex items-center gap-3">
            <button
              onClick={addToQueue}
              disabled={!urlInput.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add to Queue
            </button>
            {pendingCount > 0 && (
              <button
                onClick={processQueue}
                disabled={processing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
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

      {/* Queue */}
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
                    {item.status === 'importing' && (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
                    )}
                    {item.status === 'done' && (
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    )}
                    <code className="text-sm font-mono text-neutral-800 truncate">
                      {item.url}
                    </code>
                  </div>

                  {/* Result info */}
                  {item.result && item.status === 'done' && (
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-sm font-medium text-green-700">
                        {item.result.name}
                      </span>
                      <a
                        href={`/skills/${item.result.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {item.result && item.status === 'error' && (
                    <p className="mt-1 text-sm text-red-600">{item.result.error}</p>
                  )}

                  {/* Logs */}
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

                {/* Remove button */}
                {item.status !== 'importing' && (
                  <button
                    onClick={() => removeFromQueue(item.id)}
                    className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {queue.length === 0 && (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-lg">No imports queued</p>
          <p className="mt-1 text-sm">
            Paste GitHub URLs above and click &ldquo;Add to Queue&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}
