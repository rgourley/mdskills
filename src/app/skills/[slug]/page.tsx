import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSkillBySlug } from '@/lib/skills'
import { getSkillClients } from '@/lib/clients'
import { Star } from 'lucide-react'
import { SkillJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd'
import { SkillDetailTabs, type TabId } from '@/components/SkillDetailTabs'
import { SkillOverviewTab } from '@/components/SkillOverviewTab'
import { SkillSourceCode } from '@/components/SkillSourceCode'
import { SkillInstallationTab } from '@/components/SkillInstallationTab'
import { SkillForksTab } from '@/components/SkillForksTab'
import { SkillCommentsTab } from '@/components/SkillCommentsTab'
import { SkillActions } from '@/components/SkillActions'
import { SkillBadges } from '@/components/SkillBadges'
import { SkillQuickInfo } from '@/components/SkillQuickInfo'
import type { Metadata } from 'next'

// Cache pages for 60 seconds, revalidate in background after that
export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const skill = await getSkillBySlug(slug)
  if (!skill) return { title: 'Skill Not Found' }

  // Platform names for search: "Claude Code", "Cursor", etc.
  const platformNames = skill.platforms.map(p =>
    p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  )
  const primaryPlatform = platformNames[0] || 'AI Agents'

  // Search-optimized title that matches user intent:
  // People search: "claude code pdf skill", "interface design claude code", "stripe skill for cursor"
  // Title answers: "PDF Processing — Skill for Claude Code"
  const title = `${skill.name} — Skill for ${primaryPlatform}`

  // Description: answer "what does this do and how do I get it?"
  // Clean up internal phrasing for search snippets
  const rawDesc = skill.description
  let cleanDesc = rawDesc
    // Strip opening "This skill is for X." or "Use this skill when X."
    .replace(/^(This skill|Use this skill)[^.]*?\.\s*/i, '')
    // Strip "NOT for X." / "Do not use for X." type exclusions at start
    .replace(/^(NOT|Do not|Don't|Never)[^.]*?\.\s*/i, '')
    .replace(/^./, c => c.toUpperCase())
  // If after cleaning it's too short or still starts with a negative, use raw desc
  if (cleanDesc.length < 30 || /^(NOT|Do not|Don't|Never)\b/i.test(cleanDesc)) {
    cleanDesc = rawDesc.replace(/^./, c => c.toUpperCase())
  }
  const descTrunc = cleanDesc.length > 120 ? cleanDesc.slice(0, 117) + '...' : cleanDesc
  const platformList = platformNames.length > 1
    ? platformNames.slice(0, 3).join(', ')
    : primaryPlatform
  const fullDescription = `${descTrunc} Free and open source. Install in one command for ${platformList}.`

  return {
    title,
    description: fullDescription,
    alternates: { canonical: `/skills/${slug}` },
    openGraph: {
      title: `${skill.name} — Free Skill for ${primaryPlatform} | mdskills.ai`,
      description: fullDescription,
      url: `/skills/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `${skill.name} — Free Skill for ${primaryPlatform}`,
      description: fullDescription,
    },
    keywords: [
      skill.name,
      `${skill.name} skill`,
      `${skill.name} ${primaryPlatform.toLowerCase()}`,
      `${skill.name} SKILL.md`,
      `${primaryPlatform.toLowerCase()} ${skill.name.toLowerCase()}`,
      'AI skill',
      'SKILL.md',
      'agent skill',
      'claude code skill',
      ...(skill.tags ?? []),
      ...platformNames.map(p => p.toLowerCase()),
    ],
  }
}

export default async function SkillDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { tab } = await searchParams
  const skill = await getSkillBySlug(slug)
  if (!skill) notFound()

  const [installCommand, skillClients] = [
    `npx mdskills install ${skill.owner}/${skill.slug}`,
    await getSkillClients(skill.id),
  ]
  const validTabs = ['overview', 'source', 'installation', 'forks', 'comments'] as const
  const activeTab: TabId = tab && (validTabs as readonly string[]).includes(tab) ? (tab as TabId) : 'overview'

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Skills', url: '/skills' },
          { name: skill.name, url: `/skills/${skill.slug}` },
        ]}
      />
      <SkillJsonLd
        name={skill.name}
        description={skill.description}
        url={`/skills/${skill.slug}`}
        author={skill.owner}
        license={skill.license}
        category={skill.categoryName}
        platforms={skill.platforms}
        githubUrl={skill.githubUrl}
        dateModified={skill.updatedAt}
        tags={skill.tags}
      />
    <div className="py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link
          href="/skills"
          className="text-sm text-neutral-500 hover:text-neutral-700 mb-6 inline-block"
        >
          ← Back to skills
        </Link>
        <div className="lg:flex lg:gap-10">
          <div className="min-w-0 flex-1 max-w-4xl">

        {/* Header */}
        <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">{skill.name}</h1>
            <SkillBadges skill={skill} />
            <p className="mt-2 text-neutral-600">{skill.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
              <span>by @{skill.owner}</span>
              {skill.weeklyInstalls > 0 && (
                <span>{skill.weeklyInstalls.toLocaleString()} installs</span>
              )}
              {skill.upvotes != null && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {skill.upvotes}
                </span>
              )}
              {skill.updatedAt && <span>Updated {skill.updatedAt}</span>}
            </div>
        </div>

        {/* Action buttons */}
        <SkillActions installCommand={installCommand} skill={skill} />

        {/* Tabs */}
        <div className="mt-10">
          <SkillDetailTabs
            activeTab={activeTab}
            hasPlugin={skill.hasPlugin}

            forksCount={skill.forksCount ?? 0}
            commentsCount={skill.commentsCount ?? 0}
          />
          <div className="pt-8">
            {activeTab === 'overview' && (
              <SkillOverviewTab skill={skill} installCommand={installCommand} />
            )}
            {activeTab === 'source' && (
              <div className="space-y-6">
                <SkillSourceCode
                  content={skill.skillContent ?? ''}
                  filename="SKILL.md"
                  editHref={`/create?fork=${skill.slug}`}
                />
                <p className="text-sm text-neutral-500">
                  Full transparency — inspect the skill content before installing.
                </p>
              </div>
            )}
            {activeTab === 'installation' && (
              <SkillInstallationTab skill={skill} installCommand={installCommand} clients={skillClients} />
            )}
            {activeTab === 'forks' && <SkillForksTab forksCount={skill.forksCount} />}
            {activeTab === 'comments' && <SkillCommentsTab commentsCount={skill.commentsCount} />}
          </div>
        </div>
          </div>
            <div className="mt-10 lg:mt-0 lg:w-72 flex-shrink-0">
              <div className="lg:sticky lg:top-24">
                <SkillQuickInfo skill={skill} />
              </div>
            </div>
        </div>
      </div>
    </div>
    </>
  )
}
