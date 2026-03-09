import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { SkillCard } from '@/components/SkillCard'
import { CopyButton } from '@/components/CopyButton'
import { AgentStrip } from '@/components/AgentStrip'
import { getFeaturedSkills, getLatestSkills, getPluginSkills, getTopReviewedSkills, getHeroFeaturedSkill } from '@/lib/skills'
import { FeaturedListingCard } from '@/components/FeaturedListingCard'
import { getCategories } from '@/lib/categories'
import type { Metadata } from 'next'
import {
  Palette, SearchCode, BookOpen, TestTube, Shield, Plug, BarChart3,
  Zap, Sparkles, Rocket, Search, PenTool, Code, Terminal, Globe,
  Puzzle, Wrench, Database, Cloud, Lock, FileText, GitBranch, Cpu,
  Package, Star, Server, Workflow, type LucideIcon,
} from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('homeTitle'),
    description: t('homeDescription'),
    alternates: { canonical: '/' },
    openGraph: {
      title: t('homeTitle'),
      description: t('homeDescription'),
      url: '/',
    },
  }
}

// Cache for 60s, revalidate in background
export const revalidate = 60

/** Map DB icon slugs to Lucide icons */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'palette': Palette,
  'code-review': SearchCode,
  'book': BookOpen,
  'test-tube': TestTube,
  'shield': Shield,
  'api': Plug,
  'chart': BarChart3,
  'lightning': Zap,
  'sparkles': Sparkles,
  'rocket': Rocket,
  'search': Search,
  'pen-tool': PenTool,
  'code': Code,
  'terminal': Terminal,
  'globe': Globe,
  'puzzle': Puzzle,
  'wrench': Wrench,
  'database': Database,
  'cloud': Cloud,
  'lock': Lock,
  'file-text': FileText,
  'git-branch': GitBranch,
  'cpu': Cpu,
  'zap': Zap,
}

function getCategoryIcon(icon?: string): LucideIcon {
  if (!icon) return Package
  return CATEGORY_ICONS[icon] || Package
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('home')
  const tc = await getTranslations('common')

  const [skills, pluginSkills, latestSkills, topReviewed, categories, heroFeatured] = await Promise.all([
    getFeaturedSkills(),
    getPluginSkills(6),
    getLatestSkills(12),
    getTopReviewedSkills(6),
    getCategories(),
    getHeroFeaturedSkill(),
  ])

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-neutral-200 bg-gradient-to-b from-neutral-50 to-white overflow-x-clip">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 relative">
          <div className="flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-12">
            <div className="flex-1 min-w-0 lg:w-[60%] lg:flex-none">
              <h1 className="text-5xl sm:text-6xl font-bold text-neutral-900 tracking-tight max-w-3xl">
                {t('heroTitle')}<br />
                {t('heroTitleBold')}
              </h1>
              <p className="mt-6 text-xl text-neutral-600 max-w-2xl">
                {t('heroSubtitle')}
              </p>
              <p className="mt-4 text-lg text-neutral-600 max-w-2xl">
                {t('heroDescription')}
              </p>
              <p className="mt-3 text-sm text-neutral-500 max-w-2xl">
                {t('heroQualityNote')}
              </p>
              <div className="mt-10">
                <p className="text-sm font-medium text-neutral-900 mb-3">{t('tryItNow')}</p>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-code-bg border border-neutral-200 max-w-md">
                  <code className="flex-1 font-mono text-sm text-neutral-800">$ npx mdskills</code>
                  <CopyButton text="npx mdskills" />
                </div>
                <p className="mt-2 text-sm text-neutral-500">{t('cliHint')}</p>
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/skills"
                  className="inline-flex items-center px-6 py-3 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  {t('explore')}
                </Link>
                <Link
                  href="/submit"
                  className="inline-flex items-center px-6 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  {tc('submit')}
                </Link>
              </div>
              <AgentStrip />
            </div>
            <div className="relative flex-shrink-0 lg:w-[40%] lg:self-start lg:-mt-24">
              <div className="lg:flex lg:justify-end">
                <div className="relative w-[450px] h-[450px] sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] flex items-center justify-center">
                  <Image
                    src="/images/lobster.webp"
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
          {/* Featured card — absolute positioned so right edge aligns with container (matches header) */}
          {heroFeatured && (
            <div className="hidden lg:block absolute right-6 bottom-[326px] w-[22rem]">
              <FeaturedListingCard skill={heroFeatured} />
            </div>
          )}
        </div>
      </section>

      {/* Most Popular */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-semibold text-neutral-900">{t('mostPopular')}</h2>
            <Link href="/skills" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              {tc('viewAll')} →
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

      {/* Top Reviewed by Skill Advisor */}
      {topReviewed.length > 0 && (
        <section className="py-16 sm:py-20 border-t border-neutral-200 bg-neutral-50/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-900">{t('topReviewed')}</h2>
                <p className="mt-1 text-neutral-600">{t('highestRated').split('Skill Advisor')[0]}<Link href="/docs/skill-advisor" className="text-blue-600 hover:text-blue-700">Skill Advisor</Link></p>
              </div>
              <Link href="/docs/skill-advisor" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                {t('howWeReview')} →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topReviewed.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Claude Code Plugins */}
      {pluginSkills.length > 0 && (
        <section className="py-16 sm:py-20 border-t border-neutral-200 bg-neutral-50/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-900">{t('claudeCodePlugins')}</h2>
                <p className="mt-1 text-neutral-600">{t('pluginsDescription')}</p>
              </div>
              <Link href="/plugins" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                {t('viewAllPlugins')} →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pluginSkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Skills */}
      {latestSkills.length > 0 && (
        <section className="py-16 sm:py-20 border-t border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-900">{t('latestSkills')}</h2>
                <p className="mt-1 text-neutral-600">{t('recentlyAdded')}</p>
              </div>
              <Link href="/skills?sort=recent" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                {tc('viewAll')} →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestSkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Browse by Category */}
      {categories.length > 0 && (
        <section className="py-16 sm:py-20 border-t border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-900">{t('browseByCategory')}</h2>
                <p className="mt-1 text-neutral-600">{t('findSkills')}</p>
              </div>
              <Link href="/use-cases" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                {t('allCategories')} →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.filter(c => (c.skillCount ?? 0) > 0).map((category) => {
                const IconComponent = getCategoryIcon(category.icon)
                return (
                <Link
                  key={category.id}
                  href={`/skills?category=${category.slug}`}
                  className="group flex items-start gap-4 p-5 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md transition-all"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-100 group-hover:bg-neutral-200 flex items-center justify-center transition-colors">
                    <IconComponent className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-neutral-900 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="mt-0.5 text-sm text-neutral-500 line-clamp-1">{category.description}</p>
                    )}
                    <p className="mt-1 text-xs text-neutral-400">
                      {category.skillCount} {category.skillCount === 1 ? 'skill' : 'skills'}
                    </p>
                  </div>
                </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* What are AI Agent Skills? — SEO explainer */}
      <section className="py-16 sm:py-20 border-t border-neutral-200 bg-neutral-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-neutral-900">{t('whatAreSkills')}</h2>
            <div className="mt-6 space-y-4 text-neutral-600">
              <p>
                AI agent skills are reusable instruction sets that extend what tools like Claude Code, Cursor, Codex, and other AI coding agents can do. Defined in a standard <code className="px-1.5 py-0.5 bg-neutral-100 rounded text-sm text-neutral-700">SKILL.md</code> file, each skill teaches an AI agent how to handle a specific task — from generating PDFs and building MCP servers to writing Stripe integrations and designing interfaces.
              </p>
              <p>
                Think of skills like plugins for your AI assistant. Instead of repeatedly prompting an agent with the same instructions, you install a skill once and it activates automatically when relevant. A PDF skill knows how to read, merge, split, and create PDF files. A testing skill knows Playwright patterns and browser automation. A design skill enforces consistent spacing, typography, and component architecture.
              </p>
              <p>
                Skills are open source, free to use, and community-driven. Anyone can create a skill, publish it to GitHub, and share it here. The <code className="px-1.5 py-0.5 bg-neutral-100 rounded text-sm text-neutral-700">SKILL.md</code> format is an open standard — it works across AI agents, not just one platform.
              </p>
            </div>

            <h3 className="mt-10 text-lg font-semibold text-neutral-900">How to install a skill</h3>
            <div className="mt-4 space-y-4 text-neutral-600">
              <p>
                Discover and install skills from your terminal or browse the marketplace.
              </p>
              <div className="p-4 rounded-xl bg-code-bg border border-neutral-200 space-y-1">
                <div className="font-mono text-sm">
                  <span className="text-neutral-800">npx mdskills</span>
                  <span className="text-neutral-400 ml-6"># interactive mode</span>
                </div>
                <div className="font-mono text-sm">
                  <span className="text-neutral-800">npx mdskills search &quot;pdf&quot;</span>
                  <span className="text-neutral-400 ml-6"># search by keyword</span>
                </div>
                <div className="font-mono text-sm">
                  <span className="text-neutral-800">npx mdskills install anthropics/pdf</span>
                  <span className="text-neutral-400 ml-6"># install a specific skill</span>
                </div>
              </div>
              <div>
                <Link
                  href="/skills"
                  className="inline-flex items-center px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Browse Skills →
                </Link>
              </div>
              <p>
                Skills work with Claude Code, Cursor, GitHub Copilot, Codex, Windsurf, Gemini CLI, and many other AI coding tools. Each skill listing shows which platforms are supported and includes platform-specific installation instructions.
              </p>
            </div>

            <h3 className="mt-10 text-lg font-semibold text-neutral-900">Create your own skill</h3>
            <p className="mt-4 text-neutral-600">
              Building a skill is as simple as writing a markdown file. Define when the skill should activate, what instructions the AI should follow, and any examples or constraints. Publish it to GitHub and <Link href="/submit" className="text-blue-600 hover:text-blue-700 underline">submit it to the marketplace</Link> so others can find and use it.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-neutral-200 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-semibold text-neutral-900">{t('readyToContribute')}</h2>
          <p className="mt-4 text-neutral-600 max-w-xl mx-auto">
            {t('shareSkills')}
          </p>
          <Link
            href="/submit"
            className="mt-8 inline-flex items-center px-6 py-3 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            {t('submitListing')}
          </Link>
        </div>
      </section>
    </div>
  )
}
