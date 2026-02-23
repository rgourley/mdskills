import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createApiClient } from '@/lib/supabase/api'
import { getSkillBySlug } from '@/lib/skills'
import { getSkillClients } from '@/lib/clients'
import { Star, Info } from 'lucide-react'
import { SkillJsonLd, SkillFaqJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd'
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

export async function generateStaticParams() {
  const supabase = createApiClient()
  if (!supabase) return []
  const { data } = await supabase
    .from('skills')
    .select('slug')
    .or('status.eq.published,status.is.null')
  return (data ?? []).map(({ slug }) => ({ slug }))
}

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
  // "Interface Design for Claude Code & Cursor"
  // Keep under ~55 chars so Google doesn't truncate (template adds " | mdskills.ai")
  const platformShort = platformNames.slice(0, 2)
  const platformStr = platformShort.join(' & ')
  let title = `${skill.name} for ${platformStr}`
  // If title is getting long, fall back to just primary platform
  if (title.length > 50) {
    title = `${skill.name} for ${primaryPlatform}`
  }

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
      title: `${skill.name} for ${platformStr} | mdskills.ai`,
      description: fullDescription,
      url: `/skills/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${skill.name} for ${platformStr}`,
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
          { name: skill.artifactType === 'plugin' ? 'Plugins' : skill.artifactType === 'mcp_server' ? 'MCP Servers' : skill.artifactType === 'ruleset' ? 'Rules' : 'Skills',
            url: skill.artifactType === 'plugin' ? '/plugins' : skill.artifactType === 'mcp_server' ? '/mcp-servers' : skill.artifactType === 'ruleset' ? '/rules' : '/skills' },
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
        dateModified={skill.updatedAtIso}
        datePublished={skill.createdAtIso}
        tags={skill.tags}
        reviewScore={skill.reviewQualityScore}
        reviewSummary={skill.reviewSummary}
        reviewDate={skill.reviewGeneratedAt}
      />
      <SkillFaqJsonLd
        name={skill.name}
        description={skill.description}
        owner={skill.owner}
        slug={skill.slug}
        platforms={skill.platforms}
      />
    <div className="py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link
          href={skill.artifactType === 'plugin' ? '/plugins' : skill.artifactType === 'mcp_server' ? '/mcp-servers' : skill.artifactType === 'ruleset' ? '/rules' : '/skills'}
          className="text-sm text-neutral-500 hover:text-neutral-700 mb-6 inline-block"
        >
          ← Back to {skill.artifactType === 'plugin' ? 'plugins' : skill.artifactType === 'mcp_server' ? 'MCP servers' : skill.artifactType === 'ruleset' ? 'rules' : 'skills'}
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

        {/* Skill Advisor */}
        {skill.reviewQualityScore != null && (
          <div className="mt-6 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Skill Advisor</span>
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                skill.reviewQualityScore >= 7
                  ? 'bg-emerald-100 text-emerald-700'
                  : skill.reviewQualityScore >= 4
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {skill.reviewQualityScore}
              </span>
              <span className="text-xs text-neutral-400">/ 10</span>
              <Link href="/docs/skill-advisor" className="ml-auto text-neutral-400 hover:text-neutral-600 transition-colors" title="How we review skills">
                <Info className="w-3.5 h-3.5" />
              </Link>
            </div>
            {skill.reviewSummary && (
              <p className="text-sm text-neutral-600 mb-2">{skill.reviewSummary}</p>
            )}
            {((skill.reviewStrengths && skill.reviewStrengths.length > 0) || (skill.reviewWeaknesses && skill.reviewWeaknesses.length > 0)) && (
              <ul className="space-y-1">
                {skill.reviewStrengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-sm text-neutral-600">
                    <span className="text-emerald-500 mt-0.5 shrink-0 font-medium">+</span>
                    {s}
                  </li>
                ))}
                {skill.reviewWeaknesses?.map((w, i) => (
                  <li key={`w${i}`} className="flex items-start gap-1.5 text-sm text-neutral-500">
                    <span className="text-amber-500 mt-0.5 shrink-0 font-medium">-</span>
                    {w}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

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
