import { locales, defaultLocale } from './config'

export function getAlternateLanguages(path: string): Record<string, string> {
  const languages: Record<string, string> = {}
  for (const locale of locales) {
    languages[locale] = locale === defaultLocale ? path : `/${locale}${path}`
  }
  languages['x-default'] = path
  return languages
}
