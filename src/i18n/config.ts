export const locales = ['en', 'zh', 'fr', 'de', 'ko'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'
