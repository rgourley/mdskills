'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useCallback, useTransition } from 'react'

interface SearchBarProps {
  defaultValue?: string
  basePath?: string
  placeholder?: string
}

export function SearchBar({ defaultValue = '', basePath = '/skills', placeholder = 'Search...' }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const form = e.currentTarget
      const q = (form.elements.namedItem('q') as HTMLInputElement)?.value ?? ''
      const params = new URLSearchParams(searchParams.toString())
      if (q) params.set('q', q)
      else params.delete('q')
      const qs = params.toString()
      startTransition(() => {
        router.push(qs ? `${basePath}?${qs}` : basePath)
      })
    },
    [router, searchParams, basePath]
  )

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
      <input
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 rounded-lg border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
      />
      <button
        type="submit"
        disabled={isPending}
        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors"
      >
        {isPending ? '...' : 'Search'}
      </button>
    </form>
  )
}
