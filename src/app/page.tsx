import Link from 'next/link'
import Image from 'next/image'
import { SkillCard } from '@/components/SkillCard'
import { CopyButton } from '@/components/CopyButton'
import { getFeaturedSkills } from '@/lib/skills'

export default async function HomePage() {
  const skills = await getFeaturedSkills()

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-neutral-200 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-12">
            <div className="flex-1 min-w-0 lg:w-[60%] lg:flex-none">
              <h1 className="text-5xl sm:text-6xl font-bold text-neutral-900 tracking-tight max-w-3xl">
                Welcome to the<br />
                Open Skills Ecosystem
              </h1>
              <p className="mt-6 text-xl text-neutral-600 max-w-2xl">
                The community layer for AI agent skills
              </p>
              <p className="mt-4 text-lg text-neutral-600 max-w-2xl">
                Discover, create, fork, and share reusable capabilities for Claude Code, Codex, Cursor, and 18+ AI agents.
              </p>
              <div className="mt-10">
                <p className="text-sm font-medium text-neutral-900 mb-3">Try it now</p>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-900 text-white max-w-md">
                  <code className="flex-1 font-mono text-sm">$ npx mdskills</code>
                  <CopyButton text="npx mdskills" />
                </div>
                <p className="mt-2 text-sm text-neutral-500">Search, browse, and install skills from your CLI</p>
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/skills"
                  className="inline-flex items-center px-6 py-3 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Browse Skills
                </Link>
                <Link
                  href="/create"
                  className="inline-flex items-center px-6 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Create Skill
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0 lg:w-[40%] lg:self-start lg:-mt-24 lg:flex lg:justify-end">
              <div className="relative w-[450px] h-[450px] sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] flex items-center justify-center">
                <Image
                  src="/images/lobster.png"
                  alt=""
                  width={600}
                  height={600}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Skills */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-semibold text-neutral-900">Featured Skills</h2>
            <Link href="/skills" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))
            ) : (
              <p className="col-span-full text-neutral-500 py-8 text-center">
                No skills yet. <Link href="/skills" className="text-blue-600 hover:underline">Browse all</Link> or run <code className="bg-neutral-100 px-1 rounded">npm run import</code> to seed from GitHub.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-neutral-200 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-semibold text-neutral-900">Ready to create?</h2>
          <p className="mt-4 text-neutral-600 max-w-xl mx-auto">
            Create skills in your browser — no Git or GitHub required. Publish to the ecosystem when you&apos;re ready.
          </p>
          <Link
            href="/create"
            className="mt-8 inline-flex items-center px-6 py-3 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Create Your First Skill
          </Link>
        </div>
      </section>
    </div>
  )
}
