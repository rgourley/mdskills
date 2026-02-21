import { SkillCard } from '@/components/SkillCard'
import { getSkills, getPluginSkills } from '@/lib/skills'
import { SearchBar } from '@/components/SearchBar'
import { InlineFilters } from '@/components/InlineFilters'
import { getClients } from '@/lib/clients'
import { getCategoriesLight } from '@/lib/categories'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agent Skills — Free SKILL.md Files for Claude Code, Cursor & More',
  description: 'Browse and install free AI agent skills. SKILL.md files give your AI tools domain expertise — PDF processing, design systems, API integration, testing, and more. One-command install.',
  alternates: { canonical: '/skills' },
  openGraph: {
    title: 'Agent Skills — mdskills.ai',
    description: 'Browse free SKILL.md files that give AI agents domain expertise. One-command install for Claude Code, Cursor, Codex, and 27+ tools.',
    url: '/skills',
  },
  keywords: ['AI agent skills', 'SKILL.md', 'Claude Code skills', 'Cursor skills', 'agent skills marketplace', 'free AI skills'],
}

// Cache for 60s, revalidate in background
export const revalidate = 60

interface PageProps {
  searchParams: Promise<{
    q?: string
    tag?: string
    category?: string
    plugin?: string
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
  const clientSlug = params.client ?? ''
  const sort = (params.sort as 'trending' | 'popular' | 'recent') || undefined

  const [skills, clients, categories] = await Promise.all([
    pluginsOnly
      ? getPluginSkills(100)
      : getSkills({
          query,
          tags,
          categorySlug: category || undefined,
          artifactType: 'skill_pack',
          clientSlug: clientSlug || undefined,
          sort,
        }),
    getClients(),
    getCategoriesLight(),
  ])

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero / Intro */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            {pluginsOnly ? 'Claude Code Plugins' : 'Agent Skills'}
          </h1>
          <p className="mt-2 text-neutral-600 max-w-2xl">
            {pluginsOnly
              ? 'Skills with plugin support for full features in Claude Code.'
              : 'SKILL.md files package domain expertise into something any AI agent can use. Drop one into your project and your agent learns how to process PDFs, design interfaces, write tests, or whatever the skill teaches.'}
          </p>
        </div>

        <SearchBar defaultValue={query} basePath="/skills" placeholder="Search skills..." />

        <div className="mt-6">
          <InlineFilters
            basePath="/skills"
            categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
            clients={clients.map((c) => ({ slug: c.slug, name: c.name }))}
          />
        </div>

        {/* Results */}
        <div className="mt-8">
          <p className="text-sm text-neutral-500 mb-4">
            {skills.length} {skills.length === 1 ? 'skill' : 'skills'}
          </p>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))
            ) : (
              <p className="col-span-full text-neutral-500 py-12 text-center">
                No skills found. Try adjusting your filters.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
