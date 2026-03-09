import { Link } from '@/i18n/navigation'
import { ExternalLink } from 'lucide-react'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'docsInstall' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/docs/install-skills' },
    openGraph: {
      title: t('metaOgTitle'),
      description: t('metaOgDescription'),
      url: '/docs/install-skills',
    },
    keywords: [
      'install agent skills',
      'install SKILL.md',
      'Claude Code skills install',
      'Cursor skills install',
      'VS Code agent skills',
      'Codex skills',
      'npx skills',
      'agent skills setup',
    ],
  }
}

export default async function InstallSkillsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('docsInstall')

  const agents = [
    {
      id: 'claude-code',
      name: 'Claude Code',
      projectPath: '.claude/skills/<skill-name>/SKILL.md',
      personalPath: '~/.claude/skills/<skill-name>/SKILL.md',
      notes: [t('claudeCodeNotes1'), t('claudeCodeNotes2'), t('claudeCodeNotes3')],
      docsUrl: 'https://code.claude.com/docs/en/skills',
    },
    {
      id: 'cursor',
      name: 'Cursor',
      projectPath: '.cursor/skills/<skill-name>/SKILL.md',
      personalPath: '~/.cursor/skills/<skill-name>/SKILL.md',
      notes: [t('cursorNotes1'), t('cursorNotes2')],
      docsUrl: 'https://docs.cursor.com',
    },
    {
      id: 'vscode',
      name: 'VS Code (Copilot)',
      projectPath: '.github/skills/<skill-name>/SKILL.md',
      personalPath: '~/.copilot/skills/<skill-name>/SKILL.md',
      notes: [t('vscodeNotes1'), t('vscodeNotes2'), t('vscodeNotes3')],
      docsUrl: 'https://code.visualstudio.com/docs/copilot/customization/agent-skills',
    },
    {
      id: 'codex',
      name: 'OpenAI Codex',
      projectPath: '.agents/skills/<skill-name>/SKILL.md',
      personalPath: '~/.agents/skills/<skill-name>/SKILL.md',
      notes: [t('codexNotes')],
      docsUrl: 'https://developers.openai.com/codex/skills/',
    },
    {
      id: 'gemini',
      name: 'Gemini CLI',
      projectPath: '.gemini/skills/<skill-name>/SKILL.md',
      personalPath: '~/.gemini/skills/<skill-name>/SKILL.md',
      notes: [t('geminiNotes')],
      docsUrl: 'https://github.com/google-gemini/gemini-cli',
    },
  ]

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link
          href="/docs"
          className="text-sm text-neutral-500 hover:text-neutral-700 mb-8 inline-block"
        >
          {t('backToDocs')}
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">
            {t('title')}
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            {t('intro')}
          </p>
        </div>

        <section className="prose-neutral">

          {/* Universal approach */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">{t('universalTitle')}</h2>
          <p className="text-neutral-600 mb-4">
            {t('universalText')}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 my-6">
            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50">
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">{t('projectSkills')}</h3>
              <p className="text-sm text-neutral-600">
                {t('projectSkillsDesc')}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50">
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">{t('personalSkills')}</h3>
              <p className="text-sm text-neutral-600">
                {t('personalSkillsDesc')}
              </p>
            </div>
          </div>

          {/* Manual download */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">{t('manualTitle')}</h2>
          <p className="text-neutral-600 mb-4">
            {t('manualText')}
          </p>

          <ol className="list-decimal pl-5 space-y-3 text-neutral-600 mb-4">
            <li>
              <strong>{t('manualStep1').split(' on ')[0]}</strong>{' '}
              {t('manualStep1').replace(t('manualStep1').split(' on ')[0], '')}
            </li>
            <li>
              <strong>{t('manualStep2').split(' in ')[0]}</strong>{' '}
              {t('manualStep2').replace(t('manualStep2').split(' in ')[0], '')}
              <div className="rounded-lg bg-code-bg border border-neutral-200 text-neutral-800 p-3 font-mono text-sm my-2">
                mkdir -p .claude/skills/my-skill
              </div>
            </li>
            <li>
              <strong>{t('manualStep3Prefix')}</strong>{' '}
              <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">SKILL.md</code>{' '}
              {t('manualStep3Suffix')}
              <div className="rounded-lg bg-code-bg border border-neutral-200 text-neutral-800 p-3 font-mono text-sm my-2">
                mv ~/Downloads/SKILL.md .claude/skills/my-skill/
              </div>
            </li>
            <li>
              <strong>{t('manualStep4')}</strong>
            </li>
          </ol>

          <p className="text-neutral-600 mb-4">
            {t('folderNameNote')}
          </p>

          <div className="p-5 rounded-xl bg-blue-50 border border-blue-100 text-sm text-neutral-700 mb-6">
            <strong>{t('whereToSave')}</strong> {t('whereToSaveText')}
          </div>

          {/* CLI install */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">{t('cliTitle')}</h2>
          <p className="text-neutral-600 mb-4">
            {t('cliText')}
          </p>

          <div className="rounded-xl bg-code-bg border border-neutral-200 text-neutral-800 p-4 font-mono text-sm my-6">
            <div className="text-neutral-400"># Install from mdskills.ai</div>
            <div>npx mdskills install &lt;skill-name&gt;</div>
            <div className="mt-3 text-neutral-400"># Or use the Vercel CLI</div>
            <div>npx skills add &lt;owner&gt;/&lt;repo&gt;</div>
            <div className="mt-3 text-neutral-400"># Or install manually &mdash; just clone and copy</div>
            <div>git clone https://github.com/owner/skills-repo.git</div>
            <div>cp -r skills-repo/my-skill .claude/skills/</div>
          </div>

          <p className="text-neutral-600 mb-4">
            {t('cliAutoDetect')}
          </p>

          {/* Per-agent guides */}
          <h2 id="agent-setup" className="text-xl font-semibold text-neutral-900 mt-10 mb-4 scroll-mt-20">{t('agentSetupTitle')}</h2>

          <div className="space-y-6 my-6">
            {agents.map((agent) => (
              <div key={agent.id} id={agent.id} className="p-5 rounded-xl border border-neutral-200 bg-white scroll-mt-20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-neutral-900">{agent.name}</h3>
                  <a
                    href={agent.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {t('docs')} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-neutral-500 mt-0.5 shrink-0 w-14">{t('projectLabel')}</span>
                    <code className="text-xs font-mono text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                      {agent.projectPath}
                    </code>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-neutral-500 mt-0.5 shrink-0 w-14">{t('personalLabel')}</span>
                    <code className="text-xs font-mono text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                      {agent.personalPath}
                    </code>
                  </div>
                </div>

                <div className="space-y-3">
                  {agent.notes.map((note, i) => (
                    <p key={i} className="text-sm text-neutral-600">{note}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cross-agent compatibility */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">{t('crossAgentTitle')}</h2>
          <p className="text-neutral-600 mb-4">
            {t('crossAgentText')}
          </p>

          <div className="p-5 rounded-xl bg-blue-50 border border-blue-100 text-sm text-neutral-700">
            {t('crossAgentTip')}
          </div>

          {/* Verifying */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">{t('verifyTitle')}</h2>
          <p className="text-neutral-600 mb-4">
            {t('verifyText')}
          </p>

          <ul className="list-disc pl-5 space-y-2 text-neutral-600 mb-4">
            <li>{t('verifyClaudeCode')}</li>
            <li>{t('verifyVscode')}</li>
            <li>{t('verifyAny')}</li>
          </ul>

          <p className="text-neutral-600">
            {t('verifyTroubleshoot')}
          </p>

          {/* Links */}
          <div className="mt-12 flex flex-wrap gap-6">
            <Link
              href="/skills"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              {t('browseSkills')} &rarr;
            </Link>
            <Link
              href="/docs/create-a-skill"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              {t('createOwn')} &rarr;
            </Link>
            <Link
              href="/docs/skill-best-practices"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              {t('bestPractices')} &rarr;
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
