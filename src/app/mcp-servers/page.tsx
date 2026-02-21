import { SkillCard } from '@/components/SkillCard'
import { getSkills } from '@/lib/skills'
import { SearchBar } from '@/components/SearchBar'
import { InlineFilters } from '@/components/InlineFilters'
import { getClients } from '@/lib/clients'
import { getCategoriesLight } from '@/lib/categories'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MCP Servers — Connect AI Agents to APIs, Databases & Tools',
  description: 'Browse MCP (Model Context Protocol) servers that give AI agents real capabilities. Search the web, query databases, call APIs, manage files, and more. Works with Claude Code, Cursor, and 27+ agents.',
  alternates: { canonical: '/mcp-servers' },
  openGraph: {
    title: 'MCP Servers — mdskills.ai',
    description: 'Browse MCP servers that connect AI agents to APIs, databases, and external tools. One-command install for Claude Code, Cursor, and more.',
    url: '/mcp-servers',
  },
  keywords: ['MCP servers', 'Model Context Protocol', 'AI agent tools', 'Claude MCP', 'Cursor MCP', 'MCP marketplace', 'AI integrations'],
}

export const revalidate = 60

interface PageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    client?: string
    sort?: string
  }>
}

export default async function McpServersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = params.q ?? ''
  const category = params.category ?? ''
  const clientSlug = params.client ?? ''
  const sort = (params.sort as 'trending' | 'popular' | 'recent') || undefined

  const [skills, clients, categories] = await Promise.all([
    getSkills({
      query: query || undefined,
      categorySlug: category || undefined,
      artifactType: 'mcp_server',
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
          <h1 className="text-3xl font-bold text-neutral-900">MCP Servers</h1>
          <p className="mt-2 text-neutral-600 max-w-2xl">
            MCP (Model Context Protocol) servers let AI agents reach beyond the codebase. They connect your agent to external APIs, databases, search engines, and services through a standardized protocol — so the agent can actually take action, not just write code.
          </p>
        </div>

        <SearchBar defaultValue={query} basePath="/mcp-servers" placeholder="Search MCP servers..." />

        <div className="mt-6">
          <InlineFilters
            basePath="/mcp-servers"
            categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
            clients={clients.map((c) => ({ slug: c.slug, name: c.name }))}
          />
        </div>

        {/* Results */}
        <div className="mt-8">
          <p className="text-sm text-neutral-500 mb-4">
            {skills.length} {skills.length === 1 ? 'server' : 'servers'}
          </p>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))
            ) : (
              <p className="col-span-full text-neutral-500 py-12 text-center">
                No MCP servers found. Try adjusting your filters.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
