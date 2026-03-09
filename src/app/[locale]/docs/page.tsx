import { Link } from '@/i18n/navigation'
import { BookOpen, Code, Download, GitCompare, Lightbulb, Puzzle, Server, FileText, Bot, ScrollText, Zap, ArrowRight } from 'lucide-react'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'docsHub' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/docs' },
    openGraph: {
      title: t('metaOgTitle'),
      description: t('metaOgDescription'),
      url: '/docs',
    },
    keywords: ['AI agent docs', 'SKILL.md', 'AGENTS.md', 'CLAUDE.md', '.cursorrules', 'MCP servers', 'AI plugins', 'agent configuration'],
  }
}

export default async function DocsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('docsHub')
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Intro */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-neutral-900">{t('title')}</h1>
          <p className="mt-3 text-lg text-neutral-600">
            {t('intro')}
          </p>
        </div>

        {/* Getting Started */}
        <div className="mb-12 p-6 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold">{t('gettingStarted')}</h2>
          </div>
          <p className="text-neutral-300 text-sm mb-5">
            {t('gettingStartedDesc')}
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <p className="text-sm font-medium">{t('step1Title')}</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {t('step1Desc').split(', ')[0].replace('Explore skills', '')}{' '}
                  <Link href="/skills" className="text-blue-400 hover:text-blue-300">{t('browseSkills').replace(' →', '').replace('Browse ', '').toLowerCase()}</Link>,{' '}
                  <Link href="/plugins" className="text-blue-400 hover:text-blue-300">{t('browsePlugins').replace(' →', '').replace('Browse ', '').toLowerCase()}</Link>,{' '}
                  <Link href="/mcp-servers" className="text-blue-400 hover:text-blue-300">{t('browseMcpServers').replace(' →', '').replace('Browse ', '').toLowerCase()}</Link>, or{' '}
                  <Link href="/rules" className="text-blue-400 hover:text-blue-300">{t('browseRules').replace(' →', '').replace('Browse ', '').toLowerCase()}</Link>.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <p className="text-sm font-medium">{t('step2Title')}</p>
                <div className="mt-1.5 rounded-lg bg-white/10 px-3 py-2 font-mono text-xs text-neutral-200">
                  npx mdskills install owner/skill-name
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">3</span>
              <div>
                <p className="text-sm font-medium">{t('step3Title')}</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {t('step3Desc')}
                </p>
              </div>
            </div>
          </div>
          <Link href="/docs/install-skills" className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
            {t('detailedInstallGuide')} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* What is mdskills.ai? */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">{t('whatIsTitle')}</h2>
          <p className="text-neutral-600 mb-3">
            {t('whatIsIntro')}
          </p>
          <ul className="space-y-2 text-neutral-600 ml-1">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <span><strong>Skills</strong> (SKILL.md) — {t('skillsLayer').split(' — ')[1]}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
              <span><strong>Plugins</strong> — {t('pluginsLayer').split(' — ')[1]}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              <span><strong>MCP Servers</strong> — {t('mcpLayer').split(' — ')[1]}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              <span><strong>Rules</strong> (CLAUDE.md, .cursorrules, AGENTS.md) — {t('rulesLayer').split(' — ')[1]}</span>
            </li>
          </ul>
          <p className="text-neutral-600 mt-3">
            {t('whatIsOutro')}
          </p>
        </div>

        {/* The 3 Layers */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">{t('threeLayersTitle')}</h2>
          <div className="space-y-4">
            {[
              {
                title: t('rulesLayerTitle'),
                icon: FileText,
                color: 'bg-amber-50 text-amber-700',
                description: t('rulesLayerDesc'),
                formats: ['CLAUDE.md', '.cursorrules', 'AGENTS.md', 'GEMINI.md', '.clinerules'],
                links: [
                  { label: t('browseRules'), href: '/rules' },
                  { label: t('agentsMdSpec'), href: '/specs/agents-md' },
                ],
              },
              {
                title: t('skillsPluginsTitle'),
                icon: Puzzle,
                color: 'bg-blue-50 text-blue-700',
                description: t('skillsPluginsDesc'),
                formats: ['SKILL.md', 'Plugins'],
                links: [
                  { label: t('whatAreSkills'), href: '/docs/what-are-skills' },
                  { label: t('browseSkills'), href: '/skills' },
                  { label: t('browsePlugins'), href: '/plugins' },
                ],
              },
              {
                title: t('toolsServersTitle'),
                icon: Server,
                color: 'bg-green-50 text-green-700',
                description: t('toolsServersDesc'),
                formats: ['MCP Servers', 'OpenAPI Actions'],
                links: [
                  { label: t('whatIsMcp'), href: '/docs/what-is-mcp' },
                  { label: t('browseMcpServers'), href: '/mcp-servers' },
                ],
              },
            ].map((layer) => {
              const Icon = layer.icon
              return (
                <div key={layer.title} className="p-5 rounded-xl border border-neutral-200 bg-white">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${layer.color} flex items-center justify-center`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-neutral-900">{layer.title}</h3>
                      <p className="mt-1 text-sm text-neutral-600">{layer.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {layer.formats.map((f) => (
                          <span key={f} className="px-2 py-0.5 rounded-md bg-neutral-100 text-xs font-mono text-neutral-700">
                            {f}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4">
                        {layer.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            {link.label} &rarr;
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Guides */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">{t('guidesTitle')}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: BookOpen, title: t('guideSkillsTitle'), desc: t('guideSkillsDesc'), href: '/docs/what-are-skills' },
              { icon: FileText, title: t('guideCreateTitle'), desc: t('guideCreateDesc'), href: '/docs/create-a-skill' },
              { icon: Lightbulb, title: t('guideBestTitle'), desc: t('guideBestDesc'), href: '/docs/skill-best-practices' },
              { icon: GitCompare, title: t('guideVsTitle'), desc: t('guideVsDesc'), href: '/docs/skills-vs-mcp' },
              { icon: Download, title: t('guideInstallTitle'), desc: t('guideInstallDesc'), href: '/docs/install-skills' },
              { icon: Code, title: t('guideExamplesTitle'), desc: t('guideExamplesDesc'), href: '/docs/skill-examples' },
              { icon: Server, title: t('guideMcpTitle'), desc: t('guideMcpDesc'), href: '/docs/what-is-mcp' },
              { icon: Bot, title: t('guideAgentsTitle'), desc: t('guideAgentsDesc'), href: '/clients' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group block p-5 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4.5 h-4.5 text-neutral-500 group-hover:text-blue-600 transition-colors" />
                    <h3 className="font-semibold text-sm text-neutral-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-1.5 text-xs text-neutral-600">{item.desc}</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Specs & Standards */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <ScrollText className="w-5 h-5 text-neutral-600" />
            <h2 className="text-xl font-semibold text-neutral-900">{t('specsTitle')}</h2>
          </div>
          <p className="text-sm text-neutral-600 mb-4">
            {t('specsIntro')}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'SKILL.md', href: '/specs/skill-md', desc: t('specSkillMd') },
              { label: 'AGENTS.md', href: '/specs/agents-md', desc: t('specAgentsMd') },
              { label: 'MCP Protocol', href: '/specs/mcp', desc: t('specMcp') },
              { label: 'CLAUDE.md', href: '/specs/claude-md', desc: t('specClaudeMd') },
              { label: '.cursorrules', href: '/specs/cursorrules', desc: t('specCursorrules') },
              { label: 'llms.txt', href: '/specs/llms-txt', desc: t('specLlmsTxt') },
              { label: 'SOUL.md', href: '/specs/soul-md', desc: t('specSoulMd') },
            ].map((spec) => (
              <Link
                key={spec.href}
                href={spec.href}
                className="group block p-4 rounded-lg border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md transition-all duration-200"
              >
                <h3 className="font-semibold font-mono text-sm text-neutral-900 group-hover:text-blue-600 transition-colors">
                  {spec.label}
                </h3>
                <p className="mt-1 text-xs text-neutral-500">{spec.desc}</p>
              </Link>
            ))}
          </div>
          <Link
            href="/specs"
            className="inline-block mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {t('allSpecs')} &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
