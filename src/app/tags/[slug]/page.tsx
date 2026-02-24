import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTagInfo, getAllTagSlugs } from '@/lib/tags'
import { getSkills } from '@/lib/skills'
import { SkillCard } from '@/components/SkillCard'
import { Pagination } from '@/components/Pagination'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await getAllTagSlugs()
  return slugs.map((slug) => ({ slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTagInfo(slug)
  if (!tag) return { title: 'Tag Not Found' }

  return {
    title: tag.title,
    description: tag.description,
    alternates: { canonical: `/tags/${slug}` },
    openGraph: {
      title: `${tag.title} | mdskills.ai`,
      description: tag.description,
      url: `/tags/${slug}`,
    },
    keywords: [tag.name, 'AI skills', 'SKILL.md', 'agent skills', 'MCP servers', slug],
  }
}

export default async function TagDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)

  const tag = await getTagInfo(slug)
  if (!tag) notFound()

  const result = await getSkills({ tags: [slug], page })

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link
          href="/tags"
          className="text-sm text-neutral-500 hover:text-neutral-700 mb-8 inline-block"
        >
          &larr; All tags
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">{tag.title}</h1>
          <p className="mt-2 text-neutral-600 max-w-2xl">{tag.description}</p>
          <p className="mt-2 text-sm text-neutral-500">
            {tag.skillCount} {tag.skillCount === 1 ? 'listing' : 'listings'}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {result.skills.length > 0 ? (
            result.skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))
          ) : (
            <p className="col-span-full text-neutral-500 py-12 text-center">
              No listings found for this tag.
            </p>
          )}
        </div>

        <Pagination
          currentPage={result.page}
          totalPages={result.totalPages}
          basePath={`/tags/${slug}`}
          searchParams={{}}
        />
      </div>
    </div>
  )
}
