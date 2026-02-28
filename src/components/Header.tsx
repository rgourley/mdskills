'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useCallback, useTransition, useRef, useEffect } from 'react'
import { Menu, X, Search } from 'lucide-react'
import { UserMenu } from './UserMenu'

const NAV_LINKS = [
  { label: 'Skills', href: '/skills', exact: true },
  { label: 'MCP Servers', href: '/mcp-servers' },
  { label: 'Rules', href: '/rules' },
  { label: 'Plugins', href: '/plugins' },
  { label: 'Tools', href: '/tools' },
  { label: 'Use Cases', href: '/use-cases' },
  { label: 'Docs', href: '/docs' },
]

/** Check if a nav link is active. Detail pages live under /skills/[slug] regardless of type,
 *  so /skills uses exact match only (not startsWith) to avoid false highlights on MCP server / rule / etc detail pages. */
function isNavActive(pathname: string, link: typeof NAV_LINKS[number]): boolean {
  if (link.exact) return pathname === link.href
  return pathname.startsWith(link.href)
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const [, startTransition] = useTransition()

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement)?.value?.trim() ?? ''
      setMenuOpen(false)
      setSearchOpen(false)
      if (q) {
        startTransition(() => router.push(`/skills?q=${encodeURIComponent(q)}`))
      }
    },
    [router]
  )

  return (
    <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center group flex-shrink-0" onClick={() => { setMenuOpen(false); setSearchOpen(false) }}>
          <img src="/images/logo.svg" alt="mdskills" width={135} height={44} className="h-6 w-auto" />
        </Link>

        {/* Spacer pushes nav to the right */}
        <div className="flex-1" />

        {/* Desktop nav — right-aligned */}
        <nav className="hidden lg:flex items-center gap-1 flex-shrink-0">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                isNavActive(pathname, link)
                  ? 'text-neutral-900 font-medium bg-neutral-100'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop search icon */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors flex-shrink-0"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Desktop user menu */}
        <div className="hidden lg:block flex-shrink-0">
          <UserMenu />
        </div>

        {/* Mobile: search icon + hamburger */}
        <div className="flex items-center gap-1 lg:hidden">
          <button
            onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false) }}
            className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false) }}
            className="p-2 -mr-2 text-neutral-600 hover:text-neutral-900 transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Search bar — slides down when search icon clicked */}
      {searchOpen && (
        <div className="border-t border-neutral-100 bg-white px-4 sm:px-6 py-3">
          <form onSubmit={handleSearch} className="max-w-6xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                ref={searchInputRef}
                name="q"
                type="search"
                placeholder="Search skills, plugins, MCP servers..."
                className="w-full pl-9 pr-20 py-2 rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent focus:bg-white transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-neutral-100 bg-white px-4 pb-4 pt-2 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isNavActive(pathname, link)
                  ? 'bg-neutral-100 text-neutral-900 font-medium'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-neutral-100 mt-2">
            <UserMenu />
          </div>
        </nav>
      )}
    </header>
  )
}
