import { SkillCard } from '@/components/SkillCard'
import { getSkills, getPluginSkills } from '@/lib/skills'
import { SearchBar } from '@/components/SearchBar'
import { ExploreFilters } from '@/components/ExploreFilters'
import { getClients } from '@/lib/clients'
import { getCategoriesLight } from '@/lib/categories'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Free AI Skills for Claude Code, Cursor & Codex',
  description: 'Search and download free AI agent skills. PDF processing, design systems, Stripe, Cloudflare, testing tools and more. Filter by platform, category, or type. One-command install.',
  alternates: { canonical: '/skills' },
  openGraph: {
    title: 'Browse Free AI Agent Skills — mdskills.ai',
    description: 'Search and download free AI agent skills. Filter by platform, category, or type. One-command install for Claude Code, Cursor, Codex and more.',
    url: '/skills',
  },
}

// Cache for 60s, revalidate in background
export const revalidate = 60

interface PageProps {
  searchParams: Promise<{
    q?: string
    tag?: string
    category?: string
    plugin?: string
    type?: string
    client?: string
    sort?: string
  }>
}

export default async function SkillsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = params.q ?? ''
  const tags = params.tag ? [params.tag] : undefined
  const category = params.category ?? ''
  const pluginsOnly = params.plugin === '1'
  const artifactType = params.type ?? ''
  const clientSlug = params.client ?? ''
  const sort = (params.sort as 'trending' | 'popular' | 'recent') || undefined

  const [skills, clients, categories] = await Promise.all([
    pluginsOnly
      ? getPluginSkills(100)
      : getSkills({
          query,
          tags,
          categorySlug: category || undefined,
          artifactType: artifactType || undefined,
          clientSlug: clientSlug || undefined,
          sort,
        }),
    getClients(),
    getCategoriesLight(),
  ])

  // Build active filter description
  const activeFilters: string[] = []
  if (artifactType) activeFilters.push(artifactType.replace('_', ' '))
  if (clientSlug) {
    const c = clients.find((cl) => cl.slug === clientSlug)
    if (c) activeFilters.push(c.name)
  }
  if (category) {
    const cat = categories.find((ct) => ct.slug === category)
    if (cat) activeFilters.push(cat.name)
  }

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">
            {pluginsOnly ? 'Claude Code Plugins' : 'Explore'}
          </h1>
          <p className="mt-2 text-neutral-600">
            {pluginsOnly
              ? 'Skills with plugin support for full features in Claude Code.'
              : 'Discover skills, MCP servers, workflows, and more for your AI tools.'}
          </p>
        </div>

        <SearchBar defaultValue={query} />

        {activeFilters.length > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
            <span>Filtering by:</span>
            {activeFilters.map((f) => (
              <span key={f} className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-xs font-medium capitalize">
                {f}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col lg:flex-row gap-10">
          {/* Filter Sidebar */}
          <ExploreFilters
            clients={clients.map((c) => ({ slug: c.slug, name: c.name }))}
            categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
          />

          {/* Results Grid */}
          <div className="flex-1 min-w-0">
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))
              ) : (
                <p className="col-span-full text-neutral-500 py-12 text-center">
                  No results found. Try adjusting your filters.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
