import { SkillCard } from '@/components/SkillCard'
import { getSkills } from '@/lib/skills'
import { SearchBar } from '@/components/SearchBar'
import { InlineFilters } from '@/components/InlineFilters'
import { Pagination } from '@/components/Pagination'
import { getClients } from '@/lib/clients'
import { getCategoriesLight } from '@/lib/categories'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plugins: Claude Code Plugins for AI Agent Superpowers',
  description: 'Browse Claude Code plugins that extend your AI agent with commands, hooks, persistent memory, and more. Install plugins with one command for the best Claude Code experience.',
  alternates: { canonical: '/plugins' },
  openGraph: {
    title: 'Plugins | mdskills.ai',
    description: 'Browse Claude Code plugins that add commands, hooks, and persistent memory. One-command install.',
    url: '/plugins',
  },
  keywords: ['Claude Code plugins', 'AI plugins', 'Claude plugin', 'claude-code plugin', 'AI agent plugins', 'plugin marketplace'],
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

export default async function PluginsPage({ searchParams }: PageProps) {
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
      artifactType: 'plugin',
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
          <h1 className="text-3xl font-bold text-neutral-900">Plugins</h1>
          <p className="mt-2 text-neutral-600 max-w-2xl">
            Plugins are full-featured extensions for Claude Code. They bundle skills, slash commands, hooks, agents, and more into a single installable package. Install a plugin to unlock new capabilities.
          </p>
        </div>

        <SearchBar defaultValue={query} basePath="/plugins" placeholder="Search plugins..." />

        <div className="mt-6">
          <InlineFilters
            basePath="/plugins"
            categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
            clients={clients.map((c) => ({ slug: c.slug, name: c.name }))}
          />
        </div>

        {/* Results */}
        <div className="mt-8">
          <p className="text-sm text-neutral-500 mb-4">
            {result.total} {result.total === 1 ? 'plugin' : 'plugins'}
          </p>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {result.skills.length > 0 ? (
              result.skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))
            ) : (
              <p className="col-span-full text-neutral-500 py-12 text-center">
                No plugins found. Try adjusting your filters.
              </p>
            )}
          </div>

          <Pagination
            currentPage={result.page}
            totalPages={result.totalPages}
            basePath="/plugins"
            searchParams={{ q: query, category, client: clientSlug, sort }}
          />
        </div>
      </div>
    </div>
  )
}
