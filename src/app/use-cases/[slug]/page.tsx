import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategoryBySlug } from '@/lib/categories'
import { getSkills } from '@/lib/skills'
import { SkillCard } from '@/components/SkillCard'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function UseCaseDetailPage({ params }: PageProps) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const skills = await getSkills({ categorySlug: slug })

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link
          href="/use-cases"
          className="text-sm text-neutral-500 hover:text-neutral-700 mb-8 inline-block"
        >
          &larr; All use cases
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">{category.name}</h1>
          {category.description && (
            <p className="mt-2 text-neutral-600">{category.description}</p>
          )}
          <p className="mt-2 text-sm text-neutral-500">
            {category.skillCount ?? 0} {(category.skillCount ?? 0) === 1 ? 'listing' : 'listings'}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))
          ) : (
            <p className="col-span-full text-neutral-500 py-12 text-center">
              No listings in this category yet.
            </p>
          )}
        </div>

        {skills.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href={`/skills?category=${slug}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all in Explore with filters &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
