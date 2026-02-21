'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'

interface FilterOption {
  slug: string
  name: string
}

interface InlineFiltersProps {
  basePath: string
  categories: FilterOption[]
  clients: FilterOption[]
}

const SORT_OPTIONS: FilterOption[] = [
  { slug: 'popular', name: 'Most Popular' },
  { slug: 'recent', name: 'Recently Added' },
  { slug: 'trending', name: 'Trending' },
]

export function InlineFilters({ basePath, categories, clients }: InlineFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showAllCategories, setShowAllCategories] = useState(false)

  const activeCategory = searchParams.get('category') ?? ''
  const activeClient = searchParams.get('client') ?? ''
  const activeSort = searchParams.get('sort') ?? ''

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      const qs = params.toString()
      startTransition(() => {
        router.push(qs ? `${basePath}?${qs}` : basePath)
      })
    },
    [router, searchParams, basePath]
  )

  const clearAll = useCallback(() => {
    const params = new URLSearchParams()
    const q = searchParams.get('q')
    if (q) params.set('q', q)
    const qs = params.toString()
    startTransition(() => {
      router.push(qs ? `${basePath}?${qs}` : basePath)
    })
  }, [router, searchParams, basePath])

  const hasActiveFilters = activeCategory || activeClient || activeSort

  // Show first 8 categories unless expanded
  const visibleCategories = showAllCategories ? categories : categories.slice(0, 8)
  const hasMoreCategories = categories.length > 8

  return (
    <div className={`space-y-3 ${isPending ? 'opacity-70' : ''}`}>
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category chips */}
        {visibleCategories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setParam('category', activeCategory === cat.slug ? '' : cat.slug)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat.slug
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {cat.name}
          </button>
        ))}

        {hasMoreCategories && !showAllCategories && (
          <button
            onClick={() => setShowAllCategories(true)}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-neutral-500 hover:text-neutral-700 bg-neutral-50 hover:bg-neutral-100 transition-colors"
          >
            +{categories.length - 8} more
          </button>
        )}

        {/* Divider */}
        {categories.length > 0 && (clients.length > 0 || SORT_OPTIONS.length > 0) && (
          <span className="w-px h-5 bg-neutral-200 mx-1 hidden sm:block" />
        )}

        {/* Agent dropdown */}
        {clients.length > 0 && (
          <Dropdown
            label={activeClient ? clients.find((c) => c.slug === activeClient)?.name ?? 'Agent' : 'Agent'}
            active={!!activeClient}
            options={clients}
            value={activeClient}
            onChange={(v) => setParam('client', v)}
          />
        )}

        {/* Sort dropdown */}
        <Dropdown
          label={activeSort ? SORT_OPTIONS.find((s) => s.slug === activeSort)?.name ?? 'Sort' : 'Sort'}
          active={!!activeSort}
          options={SORT_OPTIONS}
          value={activeSort}
          onChange={(v) => setParam('sort', v)}
        />

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-neutral-500 hover:text-neutral-700 flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

function Dropdown({
  label,
  active,
  options,
  value,
  onChange,
}: {
  label: string
  active: boolean
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          active
            ? 'bg-neutral-900 text-white'
            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
        }`}
      >
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 min-w-[180px] max-h-64 overflow-y-auto">
            {value && (
              <button
                onClick={() => { onChange(''); setOpen(false) }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-500 hover:bg-neutral-50 transition-colors"
              >
                Clear filter
              </button>
            )}
            {options.map((opt) => (
              <button
                key={opt.slug}
                onClick={() => { onChange(value === opt.slug ? '' : opt.slug); setOpen(false) }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                  value === opt.slug
                    ? 'bg-neutral-100 text-neutral-900 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
