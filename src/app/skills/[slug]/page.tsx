import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSkillBySlug } from '@/lib/skills'
import { Package, Star } from 'lucide-react'
import { SkillDetailTabs, type TabId } from '@/components/SkillDetailTabs'
import { SkillOverviewTab } from '@/components/SkillOverviewTab'
import { SkillSourceCode } from '@/components/SkillSourceCode'
import { SkillForksTab } from '@/components/SkillForksTab'
import { SkillCommentsTab } from '@/components/SkillCommentsTab'
import { SkillActions } from '@/components/SkillActions'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function SkillDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { tab } = await searchParams
  const skill = await getSkillBySlug(slug)
  if (!skill) notFound()

  const installCommand = `npx mdskills install ${skill.owner}/${skill.slug}`
  const activeTab: TabId = ['overview', 'source', 'forks', 'comments'].includes(tab || '')
    ? (tab as TabId)
    : 'overview'

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
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
            <p className="mt-2 text-neutral-600">{skill.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
              <span>by @{skill.owner}</span>
              <span>{skill.weeklyInstalls.toLocaleString()} installs</span>
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
            {activeTab === 'forks' && <SkillForksTab forksCount={skill.forksCount} />}
            {activeTab === 'comments' && <SkillCommentsTab commentsCount={skill.commentsCount} />}
          </div>
        </div>
      </div>
    </div>
  )
}
