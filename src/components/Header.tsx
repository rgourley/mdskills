'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Skills', href: '/skills?type=skill_pack' },
  { label: 'MCP Servers', href: '/skills?type=mcp_server' },
  { label: 'Rules', href: '/skills?type=ruleset' },
  { label: 'Use Cases', href: '/use-cases' },
  { label: 'Docs', href: '/docs' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-baseline group" onClick={() => setMenuOpen(false)}>
          <span className="text-[17px] font-semibold tracking-tight text-neutral-900 group-hover:text-neutral-700 transition-colors">mdskills</span>
          <span className="text-[17px] font-light tracking-tight text-neutral-400">.ai</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href || (link.href.startsWith('/skills?') && pathname === '/skills')
                  ? 'text-neutral-900 font-medium'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/submit"
            className="text-sm font-medium px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Submit
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 -mr-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-neutral-100 bg-white px-4 pb-4 pt-2 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === link.href
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
