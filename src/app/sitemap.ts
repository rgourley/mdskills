import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { locales, defaultLocale } from '@/i18n/config'

const SITE_URL = 'https://www.mdskills.ai'

function localizedUrl(path: string, locale: string): string {
  return locale === defaultLocale
    ? `${SITE_URL}${path}`
    : `${SITE_URL}/${locale}${path}`
}

function alternates(path: string) {
  return {
    languages: Object.fromEntries([
      ...locales.map(l => [l, localizedUrl(path, l)]),
      ['x-default', `${SITE_URL}${path}`],
    ]),
  }
}

/** Generate one sitemap entry per locale for a given path */
function localizedEntry(
  path: string,
  opts: { lastModified?: Date; changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'; priority?: number },
): MetadataRoute.Sitemap {
  return locales.map(locale => ({
    url: localizedUrl(path, locale),
    lastModified: opts.lastModified ?? new Date(),
    changeFrequency: opts.changeFrequency,
    priority: locale === defaultLocale ? opts.priority : (opts.priority ?? 0.5) * 0.9,
    alternates: alternates(path),
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Static pages
  const staticPaths: Array<{ path: string; changeFrequency: 'daily' | 'weekly' | 'monthly'; priority: number }> = [
    { path: '/', changeFrequency: 'daily', priority: 1 },
    { path: '/skills', changeFrequency: 'daily', priority: 0.9 },
    { path: '/mcp-servers', changeFrequency: 'daily', priority: 0.9 },
    { path: '/rules', changeFrequency: 'daily', priority: 0.9 },
    { path: '/plugins', changeFrequency: 'daily', priority: 0.9 },
    { path: '/clients', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/use-cases', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/tags', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/submit', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/docs', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/docs/what-are-skills', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/docs/create-a-skill', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/docs/skill-best-practices', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/docs/skills-vs-mcp', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/docs/install-skills', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/docs/skill-examples', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/specs', changeFrequency: 'monthly', priority: 0.8 },
    ...['skill-md', 'agents-md', 'mcp', 'llms-txt', 'cursorrules', 'claude-md', 'soul-md'].map(slug => ({
      path: `/specs/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]

  const staticPages = staticPaths.flatMap(({ path, changeFrequency, priority }) =>
    localizedEntry(path, { changeFrequency, priority })
  )

  // Dynamic skill pages
  let skillPages: MetadataRoute.Sitemap = []
  if (supabase) {
    const { data: skills } = await supabase
      .from('skills')
      .select('slug, updated_at, artifact_type')
      .or('status.eq.published,status.is.null')
      .order('weekly_installs', { ascending: false })

    if (skills) {
      const pathPrefix: Record<string, string> = {
        plugin: '/plugins',
        mcp_server: '/mcp-servers',
        ruleset: '/rules',
        extension: '/tools',
        tool: '/tools',
      }
      skillPages = skills.flatMap((skill) =>
        localizedEntry(
          `${pathPrefix[skill.artifact_type] || '/skills'}/${skill.slug}`,
          { lastModified: new Date(skill.updated_at), changeFrequency: 'weekly', priority: 0.8 },
        )
      )
    }
  }

  // Dynamic client pages
  let clientPages: MetadataRoute.Sitemap = []
  if (supabase) {
    const { data: clients } = await supabase
      .from('clients')
      .select('slug')
      .order('sort_order', { ascending: true })

    if (clients) {
      clientPages = clients.flatMap((client) =>
        localizedEntry(`/clients/${client.slug}`, { changeFrequency: 'weekly', priority: 0.6 })
      )
    }
  }

  // Dynamic use case / category pages
  let categoryPages: MetadataRoute.Sitemap = []
  if (supabase) {
    const { data: categories } = await supabase
      .from('categories')
      .select('slug')
      .order('sort_order', { ascending: true })

    if (categories) {
      categoryPages = categories.flatMap((cat) =>
        localizedEntry(`/use-cases/${cat.slug}`, { changeFrequency: 'weekly', priority: 0.6 })
      )
    }
  }

  // Dynamic tag pages
  let tagPages: MetadataRoute.Sitemap = []
  if (supabase) {
    const { data: tagRows } = await supabase
      .from('skills')
      .select('tags')
      .or('status.eq.published,status.is.null')

    if (tagRows) {
      const tagSlugs = new Set<string>()
      for (const row of tagRows) {
        const tags: string[] = (row as { tags: string[] }).tags ?? []
        for (const tag of tags) {
          if (tag) tagSlugs.add(tag)
        }
      }
      tagPages = Array.from(tagSlugs).sort().flatMap((tag) =>
        localizedEntry(`/tags/${tag}`, { changeFrequency: 'weekly', priority: 0.5 })
      )
    }
  }

  return [...staticPages, ...skillPages, ...clientPages, ...categoryPages, ...tagPages]
}
