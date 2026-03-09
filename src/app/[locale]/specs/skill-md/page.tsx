import { Link } from '@/i18n/navigation'
import { ExternalLink } from 'lucide-react'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'specsSkillMd' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/specs/skill-md' },
    openGraph: {
      title: t('metaOgTitle'),
      description: t('metaOgDescription'),
      url: '/specs/skill-md',
    },
    keywords: ['SKILL.md', 'SKILL.md spec', 'agent skills format', 'SKILL.md specification', 'agentskills.io', 'AI agent skills'],
  }
}

export default async function SkillMdPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('specsSkillMd')
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/specs" className="text-sm text-neutral-500 hover:text-neutral-700 mb-8 inline-block">
          {t('backToSpecs')}
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">
            {t('title')}
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            {t('intro')}{' '}
            <a href="https://agentskills.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              agentskills.io
            </a>
            {t('introSuffix')}
          </p>
        </div>

        <section className="prose-neutral">
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">{t('problemTitle')}</h2>
          <p className="text-neutral-600 mb-4">
            {t('problemText')}
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">{t('howItWorksTitle')}</h2>
          <p className="text-neutral-600 mb-4">
            {t('howItWorksText')}
          </p>

          <div className="rounded-xl bg-code-bg border border-neutral-200 text-neutral-800 p-6 font-mono text-sm my-6 overflow-x-auto">
            <div className="text-neutral-400">---</div>
            <div><span className="text-blue-600">name</span>: pdf-processing</div>
            <div><span className="text-blue-600">description</span>: Extract text and tables from PDF files,</div>
            <div>  merge documents, fill forms, and convert to images.</div>
            <div><span className="text-neutral-500">license</span>: MIT</div>
            <div><span className="text-neutral-500">compatibility</span>:</div>
            <div>  - Claude Code</div>
            <div>  - Cursor</div>
            <div><span className="text-neutral-500">allowed-tools</span>: Bash(python:*) Read Write</div>
            <div className="text-neutral-400">---</div>
            <div className="mt-3 text-green-700"># PDF Processing</div>
            <div className="mt-1 text-neutral-700">When the user asks you to work with PDF files, follow</div>
            <div className="text-neutral-700">these instructions...</div>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">{t('frontmatterTitle')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse my-6">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">{t('fieldHeader')}</th>
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">{t('requiredHeader')}</th>
                  <th className="text-left py-2 font-semibold text-neutral-900">{t('descriptionHeader')}</th>
                </tr>
              </thead>
              <tbody className="text-neutral-600">
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-mono text-xs">name</td>
                  <td className="py-2 pr-4">{t('yes')}</td>
                  <td className="py-2">{t('fieldNameDesc')}</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-mono text-xs">description</td>
                  <td className="py-2 pr-4">{t('yes')}</td>
                  <td className="py-2">{t('fieldDescriptionDesc')}</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-mono text-xs">license</td>
                  <td className="py-2 pr-4">{t('no')}</td>
                  <td className="py-2">{t('fieldLicenseDesc')}</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-mono text-xs">compatibility</td>
                  <td className="py-2 pr-4">{t('no')}</td>
                  <td className="py-2">{t('fieldCompatibilityDesc')}</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-mono text-xs">metadata</td>
                  <td className="py-2 pr-4">{t('no')}</td>
                  <td className="py-2">{t('fieldMetadataDesc')}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">allowed-tools</td>
                  <td className="py-2 pr-4">{t('no')}</td>
                  <td className="py-2">{t('fieldAllowedToolsDesc')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">{t('progressiveTitle')}</h2>
          <p className="text-neutral-600 mb-4">
            {t('progressiveText')}
          </p>
          <ol className="list-decimal list-inside space-y-2 text-neutral-600 ml-2">
            <li><strong>{t('phase1')}</strong></li>
            <li><strong>{t('phase2')}</strong></li>
            <li><strong>{t('phase3')}</strong></li>
          </ol>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">{t('supportsTitle')}</h2>
          <p className="text-neutral-600 mb-4">
            {t('supportsText')}{' '}
            <a href="https://agentskills.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              agentskills.io
            </a>.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">{t('relatedTitle')}</h2>
          <ul className="space-y-1 text-neutral-600">
            <li><Link href="/specs/agents-md" className="text-blue-600 hover:underline">AGENTS.md</Link> — {t('relatedAgentsMd').split(' — ')[1]}</li>
            <li><Link href="/specs/claude-md" className="text-blue-600 hover:underline">CLAUDE.md</Link> — {t('relatedClaudeMd').split(' — ')[1]}</li>
            <li><Link href="/specs/mcp" className="text-blue-600 hover:underline">MCP</Link> — {t('relatedMcp').split(' — ')[1]}</li>
          </ul>
        </section>

        <div className="mt-12 p-6 rounded-xl bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900">{t('officialSpecTitle')}</h3>
          <p className="mt-1 text-sm text-blue-800">
            {t('officialSpecText')}
          </p>
          <a
            href="https://agentskills.io/specification"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            {t('readFullSpec')} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
