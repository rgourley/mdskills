import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-neutral-900 hover:text-neutral-700 transition-colors">
          <span className="text-lg">mdskills</span>
          <span className="text-neutral-400 text-sm font-normal">.ai</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/skills" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
            Browse
          </Link>
          <Link href="/skills" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
            Search
          </Link>
          <Link
            href="/create"
            className="text-sm font-medium px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Create Skill
          </Link>
        </nav>
      </div>
    </header>
  )
}
