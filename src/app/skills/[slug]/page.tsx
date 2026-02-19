import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSkillBySlug } from '@/lib/skills'
import { getSkillClients } from '@/lib/clients'
import { Package, Star } from 'lucide-react'
import { SkillJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd'
import { SkillDetailTabs, type TabId } from '@/components/SkillDetailTabs'
import { SkillOverviewTab } from '@/components/SkillOverviewTab'
import { SkillSourceCode } from '@/components/SkillSourceCode'
import { SkillInstallationTab } from '@/components/SkillInstallationTab'
import { SkillExamplesTab } from '@/components/SkillExamplesTab'
import { SkillForksTab } from '@/components/SkillForksTab'
import { SkillCommentsTab } from '@/components/SkillCommentsTab'
import { SkillActions } from '@/components/SkillActions'
import { SkillBadges } from '@/components/SkillBadges'
import { SkillQuickInfo } from '@/components/SkillQuickInfo'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const skill = await getSkillBySlug(slug)
  if (!skill) return { title: 'Skill Not Found' }

  const title = `${skill.name} — AI Agent Skill`
  const description = skill.description.length > 160
    ? skill.description.slice(0, 157) + '...'
    : skill.description
  const platforms = skill.platforms.length > 0
    ? ` Works with ${skill.platforms.slice(0, 3).join(', ')}${skill.platforms.length > 3 ? ' and more' : ''}.`
    : ''

  return {
    title,
    description: `${description}${platforms}`,
    alternates: { canonical: `/skills/${slug}` },
    openGraph: {
      title: `${skill.name} — mdskills.ai`,
      description: `${description}${platforms}`,
      url: `/skills/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `${skill.name} — AI Agent Skill`,
      description,
    },
    keywords: [
      skill.name,
      'AI skill',
      'SKILL.md',
      'agent skill',
      ...(skill.tags ?? []),
      ...(skill.platforms ?? []),
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
  const validTabs = ['overview', 'source', 'installation', 'examples', 'forks', 'comments'] as const
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
      />
    <div className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="lg:flex lg:gap-10">
          <div className="min-w-0 flex-1 max-w-4xl">
        <Link
          href="/skills"
          className="text-sm text-neutral-500 hover:text-neutral-700 mb-8 inline-block"
        >
          ← Back to skills
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-8">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-neutral-100 flex items-center justify-center">
            <Package className="w-7 h-7 text-neutral-600" />
          </div>
          <div className="min-w-0 flex-1">
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
        </div>

        {/* Action buttons */}
        <SkillActions installCommand={installCommand} skill={skill} />

        {/* Tabs */}
        <div className="mt-10">
          <SkillDetailTabs
            activeTab={activeTab}
            hasPlugin={skill.hasPlugin}
            hasExamples={skill.hasExamples}
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
            {activeTab === 'examples' && <SkillExamplesTab skill={skill} />}
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
