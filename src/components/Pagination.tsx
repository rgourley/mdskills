import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  /** Base path like "/skills" or "/rules" */
  basePath: string
  /** Current search params to preserve (excluding page) */
  searchParams?: Record<string, string | undefined>
}

export function Pagination({ currentPage, totalPages, basePath, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null

  function buildHref(page: number): string {
    const params = new URLSearchParams()
    if (searchParams) {
      for (const [key, value] of Object.entries(searchParams)) {
        if (value && key !== 'page') params.set(key, value)
      }
    }
    if (page > 1) params.set('page', String(page))
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  // Build page numbers to show: always show first, last, and a window around current
  const pages: (number | 'ellipsis')[] = []
  const delta = 2 // pages to show around current

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis')
    }
  }

  const linkClass = 'flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-colors'

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 mt-10">
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className={`${linkClass} text-neutral-600 hover:bg-neutral-100`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      ) : (
        <span className={`${linkClass} text-neutral-300 cursor-not-allowed`}>
          <ChevronLeft className="w-4 h-4" />
        </span>
      )}

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className={`${linkClass} text-neutral-400 cursor-default`}>
            &hellip;
          </span>
        ) : p === currentPage ? (
          <span
            key={p}
            className={`${linkClass} bg-neutral-900 text-white`}
            aria-current="page"
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            className={`${linkClass} text-neutral-600 hover:bg-neutral-100`}
          >
            {p}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className={`${linkClass} text-neutral-600 hover:bg-neutral-100`}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className={`${linkClass} text-neutral-300 cursor-not-allowed`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  )
}
