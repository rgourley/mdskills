import { SkillCard } from '@/components/SkillCard'
import { FeaturedListingCard } from '@/components/FeaturedListingCard'
import { getSkills, getFeaturedByType } from '@/lib/skills'
import { SearchBar } from '@/components/SearchBar'
import { InlineFilters } from '@/components/InlineFilters'
import { Pagination } from '@/components/Pagination'
import { getClients } from '@/lib/clients'
import { getCategoriesLight } from '@/lib/categories'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('toolsTitle'),
    description: t('toolsDescription'),
    alternates: { canonical: '/tools' },
    openGraph: {
      title: t('toolsTitle'),
      description: t('toolsDescription'),
      url: '/tools',
    },
    keywords: ['AI developer tools', 'VS Code extensions', 'AI coding tools', 'developer utilities', 'Claude Code tools', 'AI agent tools'],
  }
}

export const revalidate = 60

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    q?: string
    category?: string
    client?: string
    sort?: string
    page?: string
  }>
}

export default async function ToolsPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const sp = await searchParams
  const query = sp.q ?? ''
  const category = sp.category ?? ''
  const clientSlug = sp.client ?? ''
  const sort = (sp.sort as 'trending' | 'popular' | 'recent') || undefined
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)

  const [result, clients, categories, featured] = await Promise.all([
    getSkills({
      query: query || undefined,
      categorySlug: category || undefined,
      artifactType: ['extension', 'tool'],
      clientSlug: clientSlug || undefined,
      sort,
      page,
    }),
    getClients(),
    getCategoriesLight(),
    getFeaturedByType(['extension', 'tool']),
  ])

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero / Intro */}
        <div className="mb-8 flex items-start gap-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-neutral-900">Tools & Extensions</h1>
            <p className="mt-2 text-neutral-600 max-w-2xl">
              Developer tools, VS Code extensions, CLIs, and utilities that enhance your AI-assisted coding workflow. Not skills or plugins — just useful things.
            </p>
          </div>
          {featured && (
            <div className="flex-shrink-0 w-[22rem]">
              <FeaturedListingCard skill={featured} />
            </div>
          )}
        </div>

        <SearchBar defaultValue={query} basePath="/tools" placeholder="Search tools & extensions..." />

        <div className="mt-6">
          <InlineFilters
            basePath="/tools"
            categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
            clients={clients.map((c) => ({ slug: c.slug, name: c.name }))}
          />
        </div>

        {/* Results */}
        <div className="mt-8">
          <p className="text-sm text-neutral-500 mb-4">
            {result.total} {result.total === 1 ? 'tool' : 'tools'}
          </p>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {result.skills.length > 0 ? (
              result.skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))
            ) : (
              <p className="col-span-full text-neutral-500 py-12 text-center">
                No tools found. Try adjusting your filters.
              </p>
            )}
          </div>

          <Pagination
            currentPage={result.page}
            totalPages={result.totalPages}
            basePath="/tools"
            searchParams={{ q: query, category, client: clientSlug, sort }}
          />
        </div>
      </div>
    </div>
  )
}
