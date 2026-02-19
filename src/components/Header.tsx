import Link from 'next/link'

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      {/* Rounded square container */}
      <rect width="28" height="28" rx="7" fill="#171717" />
      {/* Stylized "md" as interconnected paths — code/markdown feel */}
      <path
        d="M7 19V9l3.5 5L14 9v10M15.5 13.5c0-1.5 1.2-2.5 2.5-2.5s2.5 1 2.5 2.5v2c0 1.5-1.2 2.5-2.5 2.5s-2.5-1-2.5-2.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Logo />
          <div className="flex items-baseline gap-0">
            <span className="text-[17px] font-semibold tracking-tight text-neutral-900 group-hover:text-neutral-700 transition-colors">mdskills</span>
            <span className="text-[17px] font-light tracking-tight text-neutral-400">.ai</span>
          </div>
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
