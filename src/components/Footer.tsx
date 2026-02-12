import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/" className="font-semibold text-neutral-900">
            mdskills.ai
          </Link>
          <div className="flex gap-6 text-sm text-neutral-600">
            <Link href="/skills" className="hover:text-neutral-900 transition-colors">
              Browse Skills
            </Link>
            <a href="https://github.com/rgourley/mdskills" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors">
              GitHub
            </a>
          </div>
        </div>
        <p className="mt-6 text-sm text-neutral-500 text-center sm:text-left">
          The community layer for AI agent skills. Find, create, fork, and share.
        </p>
      </div>
    </footer>
  )
}
