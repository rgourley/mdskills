import Link from 'next/link'
import { getAllTags } from '@/lib/tags'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Tags: AI Agent Skills by Technology & Topic',
  description: 'Browse AI agent skills by tag. Find skills, MCP servers, plugins, and tools organized by programming language, framework, platform, and topic.',
  alternates: { canonical: '/tags' },
  openGraph: {
    title: 'Browse Tags | mdskills.ai',
    description: 'Find AI agent skills organized by technology and topic.',
    url: '/tags',
  },
  keywords: ['AI agent skills', 'skill tags', 'browse by technology', 'programming languages', 'frameworks', 'MCP servers'],
}

export const revalidate = 60

export default async function TagsPage() {
  const tags = await getAllTags()

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">Browse by Tag</h1>
          <p className="mt-2 text-neutral-600 max-w-2xl">
            Explore AI agent skills, MCP servers, plugins, and tools organized by technology, framework, and topic.
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tags/${tag.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300 transition-colors"
            >
              <span className="font-medium">{tag.name}</span>
              <span className="text-neutral-400">{tag.skillCount}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
