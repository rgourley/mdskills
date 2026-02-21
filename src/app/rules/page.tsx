import { SkillCard } from '@/components/SkillCard'
import { getSkills } from '@/lib/skills'
import { SearchBar } from '@/components/SearchBar'
import { InlineFilters } from '@/components/InlineFilters'
import { Pagination } from '@/components/Pagination'
import { getClients } from '@/lib/clients'
import { getCategoriesLight } from '@/lib/categories'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rules & Rulesets — .cursorrules, CLAUDE.md & Agent Configuration',
  description: 'Browse rules and rulesets that configure AI agent behavior. .cursorrules, CLAUDE.md, AGENTS.md, .clinerules, and more. Set coding conventions, enforce safety constraints, and standardize workflows across your team.',
  alternates: { canonical: '/rules' },
  openGraph: {
    title: 'Rules & Rulesets — mdskills.ai',
    description: 'Browse rules that configure AI agent behavior. .cursorrules, CLAUDE.md, AGENTS.md and more. Set coding standards and safety constraints.',
    url: '/rules',
  },
  keywords: ['cursorrules', 'CLAUDE.md', 'AGENTS.md', 'AI rules', 'agent configuration', 'clinerules', 'copilot instructions', 'AI coding rules'],
}

export const revalidate = 60

interface PageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    client?: string
    sort?: string
    page?: string
  }>
}

export default async function RulesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = params.q ?? ''
  const category = params.category ?? ''
  const clientSlug = params.client ?? ''
  const sort = (params.sort as 'trending' | 'popular' | 'recent') || undefined
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  const [result, clients, categories] = await Promise.all([
    getSkills({
      query: query || undefined,
      categorySlug: category || undefined,
      artifactType: 'ruleset',
      clientSlug: clientSlug || undefined,
      sort,
      page,
    }),
    getClients(),
    getCategoriesLight(),
  ])

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero / Intro */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Rules &amp; Rulesets</h1>
          <p className="mt-2 text-neutral-600 max-w-2xl">
            Rules are project-level constraints that shape how AI agents behave. Whether it&apos;s a <code className="text-sm bg-neutral-100 px-1.5 py-0.5 rounded font-mono">.cursorrules</code> file, a <code className="text-sm bg-neutral-100 px-1.5 py-0.5 rounded font-mono">CLAUDE.md</code>, or an <code className="text-sm bg-neutral-100 px-1.5 py-0.5 rounded font-mono">AGENTS.md</code> — rules tell agents what to always do, what to never do, and how your team works.
          </p>
        </div>

        <SearchBar defaultValue={query} basePath="/rules" placeholder="Search rules..." />

        <div className="mt-6">
          <InlineFilters
            basePath="/rules"
            categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
            clients={clients.map((c) => ({ slug: c.slug, name: c.name }))}
          />
        </div>

        {/* Results */}
        <div className="mt-8">
          <p className="text-sm text-neutral-500 mb-4">
            {result.total} {result.total === 1 ? 'ruleset' : 'rulesets'}
          </p>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {result.skills.length > 0 ? (
              result.skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))
            ) : (
              <p className="col-span-full text-neutral-500 py-12 text-center">
                No rulesets found. Try adjusting your filters.
              </p>
            )}
          </div>

          <Pagination
            currentPage={result.page}
            totalPages={result.totalPages}
            basePath="/rules"
            searchParams={{ q: query, category, client: clientSlug, sort }}
          />
        </div>
      </div>
    </div>
  )
}
