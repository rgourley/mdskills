import { Link } from '@/i18n/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'docsAdvisor' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/docs/skill-advisor' },
    openGraph: {
      title: t('metaOgTitle'),
      description: t('metaOgDescription'),
      url: '/docs/skill-advisor',
    },
  }
}

export default async function SkillAdvisorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('docsAdvisor')
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/docs" className="text-sm text-neutral-500 hover:text-neutral-700 mb-8 inline-block">
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
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">{t('evaluateTitle')}</h2>
          <p className="text-neutral-600 mb-4">
            {t('evaluateText')}
          </p>

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-xl border border-neutral-200 bg-white">
              <h3 className="font-semibold text-neutral-900">{t('capabilitiesTitle')}</h3>
              <p className="mt-1 text-sm text-neutral-600">
                {t('capabilitiesText')}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 bg-white">
              <h3 className="font-semibold text-neutral-900">{t('qualityTitle')}</h3>
              <p className="mt-1 text-sm text-neutral-600">
                {t('qualityText')}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 bg-white">
              <h3 className="font-semibold text-neutral-900">{t('securityTitle')}</h3>
              <p className="mt-1 text-sm text-neutral-600">
                {t('securityText')}
              </p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">{t('scoringTitle')}</h2>
          <p className="text-neutral-600 mb-4">
            {t('scoringText')}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse my-4">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">{t('scoreHeader')}</th>
                  <th className="text-left py-2 font-semibold text-neutral-900">{t('meaningHeader')}</th>
                </tr>
              </thead>
              <tbody className="text-neutral-600">
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">7</span>
                    <span className="ml-1">- 10</span>
                  </td>
                  <td className="py-2">{t('scoreHigh')}</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-amber-100 text-amber-700">4</span>
                    <span className="ml-1">- 6</span>
                  </td>
                  <td className="py-2">{t('scoreMid')}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-red-100 text-red-700">1</span>
                    <span className="ml-1">- 3</span>
                  </td>
                  <td className="py-2">{t('scoreLow')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-neutral-600 mb-4">
            {t('scoringNote')}
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">{t('flagsTitle')}</h2>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 ml-2">
            <li>{t('flagPermissions')}</li>
            <li>{t('flagOverscoped')}</li>
            <li>{t('flagMissing')}</li>
            <li>{t('flagTrigger')}</li>
            <li>{t('flagInjection')}</li>
            <li>{t('flagCredentials')}</li>
          </ul>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">{t('howGeneratedTitle')}</h2>
          <p className="text-neutral-600 mb-4">
            {t('howGeneratedText1')}
          </p>
          <p className="text-neutral-600 mb-4">
            {t('howGeneratedText2')}
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">{t('limitationsTitle')}</h2>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 ml-2">
            <li>{t('limitation1')}</li>
            <li>{t('limitation2')}</li>
            <li>{t('limitation3')}</li>
            <li>{t('limitation4')}</li>
          </ul>
        </section>

        <div className="mt-12 p-5 rounded-xl bg-blue-50 border border-blue-100 text-sm text-neutral-700">
          <strong>{t('improveScoreTitle')}</strong> {t('improveScoreText').split('SKILL.md Best Practices')[0]}
          <Link href="/docs/skill-best-practices#security" className="text-blue-600 hover:text-blue-700 font-medium">
            SKILL.md Best Practices
          </Link>
          {t('improveScoreText').split('SKILL.md Best Practices')[1]}
        </div>

        <div className="mt-6 p-6 rounded-xl bg-neutral-50 border border-neutral-200">
          <h3 className="font-semibold text-neutral-900">{t('feedbackTitle')}</h3>
          <p className="mt-1 text-sm text-neutral-600">
            {t('feedbackText')}
          </p>
          <a
            href="https://github.com/rgourley/mdskills/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {t('feedbackLink')} &rarr;
          </a>
        </div>
      </div>
    </div>
  )
}
