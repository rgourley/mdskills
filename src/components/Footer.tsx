import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'

export async function Footer() {
  const t = await getTranslations('footer')

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">{t('marketplace')}</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/skills" className="hover:text-neutral-900 transition-colors">{t('skills')}</Link>
              </li>
              <li>
                <Link href="/mcp-servers" className="hover:text-neutral-900 transition-colors">{t('mcpServers')}</Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-neutral-900 transition-colors">{t('rules')}</Link>
              </li>
              <li>
                <Link href="/use-cases" className="hover:text-neutral-900 transition-colors">{t('useCases')}</Link>
              </li>
              <li>
                <Link href="/clients" className="hover:text-neutral-900 transition-colors">{t('agents')}</Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-neutral-900 transition-colors">{t('submit')}</Link>
              </li>
              <li>
                <Link href="/advertise" className="hover:text-neutral-900 transition-colors">{t('advertise')}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">{t('docs')}</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/docs" className="hover:text-neutral-900 transition-colors">{t('ecosystemOverview')}</Link>
              </li>
              <li>
                <Link href="/docs/what-are-skills" className="hover:text-neutral-900 transition-colors">{t('whatAreSkills')}</Link>
              </li>
              <li>
                <Link href="/docs/create-a-skill" className="hover:text-neutral-900 transition-colors">{t('createSkill')}</Link>
              </li>
              <li>
                <Link href="/docs/skill-best-practices" className="hover:text-neutral-900 transition-colors">{t('bestPractices')}</Link>
              </li>
              <li>
                <Link href="/docs/skills-vs-mcp" className="hover:text-neutral-900 transition-colors">{t('skillsVsMcp')}</Link>
              </li>
              <li>
                <Link href="/docs/install-skills" className="hover:text-neutral-900 transition-colors">{t('installSkills')}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">{t('specs')}</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/specs/skill-md" className="hover:text-neutral-900 transition-colors">{t('skillMd')}</Link>
              </li>
              <li>
                <Link href="/specs/agents-md" className="hover:text-neutral-900 transition-colors">{t('agentsMd')}</Link>
              </li>
              <li>
                <Link href="/specs/mcp" className="hover:text-neutral-900 transition-colors">{t('mcpProtocol')}</Link>
              </li>
              <li>
                <Link href="/specs/claude-md" className="hover:text-neutral-900 transition-colors">{t('claudeMd')}</Link>
              </li>
              <li>
                <Link href="/specs/llms-txt" className="hover:text-neutral-900 transition-colors">{t('llmsTxt')}</Link>
              </li>
              <li>
                <Link href="/specs" className="hover:text-neutral-900 transition-colors">{t('allSpecs')} &rarr;</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">{t('community')}</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <a href="https://github.com/rgourley/mdskills" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors">{t('github')}</a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 pt-6 border-t border-neutral-200 text-sm text-neutral-500 text-center sm:text-left">
          {t('tagline')} Created by <a href="https://www.robertcreative.com/" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors">Rob Gourley</a>.
        </p>
      </div>
    </footer>
  )
}
