import { SkillCard } from '@/components/SkillCard'
import { getSkills } from '@/lib/skills'
import { SearchBar } from '@/components/SearchBar'

interface PageProps {
  searchParams: Promise<{ q?: string; tag?: string }>
}

export default async function SkillsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = params.q ?? ''
  const tags = params.tag ? [params.tag] : undefined
  const skills = await getSkills(query, tags)

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">Browse Skills</h1>
          <p className="mt-2 text-neutral-600">
            Discover skills for Claude Code, Codex, Cursor, and more.
          </p>
        </div>

        <SearchBar defaultValue={query} />

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))
          ) : (
            <p className="col-span-full text-neutral-500 py-12 text-center">
              No skills found. Try a different search.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
