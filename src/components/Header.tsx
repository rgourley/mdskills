import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-baseline group">
          <span className="text-[17px] font-semibold tracking-tight text-neutral-900 group-hover:text-neutral-700 transition-colors">mdskills</span>
          <span className="text-[17px] font-light tracking-tight text-neutral-400">.ai</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/skills" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
            Explore
          </Link>
          <Link href="/use-cases" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
            Use Cases
          </Link>
          <Link href="/docs" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
            Docs
          </Link>
          <Link href="/specs" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
            Specs
          </Link>
          <Link href="/clients" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
            Clients
          </Link>
          <Link
            href="/submit"
            className="text-sm font-medium px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Submit
          </Link>
        </nav>
      </div>
    </header>
  )
}
