'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useCallback, useTransition } from 'react'
import { Menu, X, Search } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Skills', href: '/skills' },
  { label: 'MCP Servers', href: '/mcp-servers' },
  { label: 'Rules', href: '/rules' },
  { label: 'Plugins', href: '/plugins' },
  { label: 'Use Cases', href: '/use-cases' },
  { label: 'Docs', href: '/docs' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement)?.value?.trim() ?? ''
      setMenuOpen(false)
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
        <Link href="/" className="flex items-baseline group flex-shrink-0" onClick={() => setMenuOpen(false)}>
          <span className="text-[17px] font-semibold tracking-tight text-neutral-900 group-hover:text-neutral-700 transition-colors">mdskills</span>
          <span className="text-[17px] font-light tracking-tight text-neutral-400">.ai</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 flex-shrink-0">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                pathname.startsWith(link.href)
                  ? 'text-neutral-900 font-medium bg-neutral-100'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop search — fills remaining space */}
        <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xs ml-auto">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              name="q"
              type="search"
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent focus:bg-white transition-colors"
            />
          </div>
        </form>

        {/* Desktop submit button */}
        <Link
          href="/submit"
          className="hidden lg:inline-flex text-sm font-medium px-3.5 py-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors flex-shrink-0"
        >
          Submit
        </Link>

        {/* Mobile: search icon + hamburger */}
        <div className="flex items-center gap-1 lg:hidden ml-auto">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 -mr-2 text-neutral-600 hover:text-neutral-900 transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-neutral-100 bg-white px-4 pb-4 pt-3 space-y-1">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                name="q"
                type="search"
                placeholder="Search skills, plugins, MCP servers..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>
          </form>

          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname.startsWith(link.href)
                  ? 'bg-neutral-100 text-neutral-900 font-medium'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/submit"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium bg-neutral-900 text-white text-center hover:bg-neutral-800 transition-colors mt-2"
          >
            Submit
          </Link>
        </nav>
      )}
    </header>
  )
}
