'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'

interface FilterOption {
  slug: string
  name: string
}

interface ExploreFiltersProps {
  clients: FilterOption[]
  categories: FilterOption[]
}

const ARTIFACT_TYPES: FilterOption[] = [
  { slug: 'skill_pack', name: 'Agent Skill' },
  { slug: 'mcp_server', name: 'MCP Server' },
  { slug: 'workflow_pack', name: 'Workflow Pack' },
  { slug: 'ruleset', name: 'Rules' },
  { slug: 'openapi_action', name: 'OpenAPI Action' },
  { slug: 'extension', name: 'Extension' },
  { slug: 'template_bundle', name: 'Starter Kit' },
]

const SORT_OPTIONS: FilterOption[] = [
  { slug: 'popular', name: 'Most Popular' },
  { slug: 'recent', name: 'Recently Added' },
  { slug: 'trending', name: 'Trending' },
]

export function ExploreFilters({ clients, categories }: ExploreFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const activeType = searchParams.get('type') ?? ''
  const activeClient = searchParams.get('client') ?? ''
  const activeCategory = searchParams.get('category') ?? ''
  const activeSort = searchParams.get('sort') ?? ''

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Remove plugin param since we have type filter now
      params.delete('plugin')
      startTransition(() => {
        router.push(`/skills?${params.toString()}`)
      })
    },
    [router, searchParams]
  )

  const clearAll = useCallback(() => {
    const params = new URLSearchParams()
    const q = searchParams.get('q')
    if (q) params.set('q', q)
    startTransition(() => {
      router.push(`/skills?${params.toString()}`)
    })
  }, [router, searchParams])

  const hasActiveFilters = activeType || activeClient || activeCategory || activeSort

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="lg:sticky lg:top-24 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </h3>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              disabled={isPending}
              className="text-xs text-neutral-500 hover:text-neutral-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>

        {/* Artifact Type */}
        <FilterSection title="Type">
          {ARTIFACT_TYPES.map((type) => (
            <FilterChip
              key={type.slug}
              label={type.name}
              active={activeType === type.slug}
              onClick={() => setParam('type', activeType === type.slug ? '' : type.slug)}
            />
          ))}
        </FilterSection>

        {/* Works With */}
        {clients.length > 0 && (
          <FilterSection title="Works With">
            {clients.map((client) => (
              <FilterChip
                key={client.slug}
                label={client.name}
                active={activeClient === client.slug}
                onClick={() => setParam('client', activeClient === client.slug ? '' : client.slug)}
              />
            ))}
          </FilterSection>
        )}

        {/* Use Case */}
        {categories.length > 0 && (
          <FilterSection title="Use Case">
            {categories.map((cat) => (
              <FilterChip
                key={cat.slug}
                label={cat.name}
                active={activeCategory === cat.slug}
                onClick={() => setParam('category', activeCategory === cat.slug ? '' : cat.slug)}
              />
            ))}
          </FilterSection>
        )}

        {/* Sort */}
        <FilterSection title="Sort">
          {SORT_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.slug}
              label={opt.name}
              active={activeSort === opt.slug}
              onClick={() => setParam('sort', activeSort === opt.slug ? '' : opt.slug)}
            />
          ))}
        </FilterSection>
      </div>
    </aside>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">{title}</h4>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-2.5 py-1 rounded-md text-xs font-medium transition-colors
        ${active
          ? 'bg-neutral-900 text-white'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
        }
      `}
    >
      {label}
    </button>
  )
}
