import Link from 'next/link'
import { getCategories } from '@/lib/categories'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Use Cases',
  description: 'Browse AI agent skills by use case. Find skills for code generation, DevOps, testing, documentation, design systems, data analysis, and more.',
  alternates: { canonical: '/use-cases' },
  openGraph: {
    title: 'AI Agent Skill Use Cases — mdskills.ai',
    description: 'Browse AI agent skills by use case. Find skills for code generation, DevOps, testing, documentation, design systems, data analysis, and more.',
    url: '/use-cases',
  },
}

export const revalidate = 60

export default async function UseCasesPage() {
  const categories = await getCategories()

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">Use Cases</h1>
          <p className="mt-2 text-neutral-600">
            Browse by what you want to accomplish. Find the right tools for your outcome.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/use-cases/${cat.slug}`}
              className="group block p-6 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-lg transition-all duration-200"
            >
              <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                {cat.name}
              </h3>
              {cat.description && (
                <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
                  {cat.description}
                </p>
              )}
              <div className="mt-4 text-xs text-neutral-500">
                {cat.skillCount ?? 0} {(cat.skillCount ?? 0) === 1 ? 'listing' : 'listings'}
              </div>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <p className="text-neutral-500 py-12 text-center">
            No use cases available yet.
          </p>
        )}
      </div>
    </div>
  )
}
