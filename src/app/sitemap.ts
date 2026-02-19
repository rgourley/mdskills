import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const SITE_URL = 'https://mdskills.ai'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/skills`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/clients`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/use-cases`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/docs/what-are-skills`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/docs/create-a-skill`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/specs`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...['skill-md', 'agents-md', 'mcp', 'llms-txt', 'cursorrules', 'claude-md'].map((slug) => ({
      url: `${SITE_URL}/specs/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]

  // Dynamic skill pages
  let skillPages: MetadataRoute.Sitemap = []
  if (supabase) {
    const { data: skills } = await supabase
      .from('skills')
      .select('slug, updated_at')
      .or('status.eq.published,status.is.null')
      .order('weekly_installs', { ascending: false })

    if (skills) {
      skillPages = skills.map((skill) => ({
        url: `${SITE_URL}/skills/${skill.slug}`,
        lastModified: new Date(skill.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
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
      clientPages = clients.map((client) => ({
        url: `${SITE_URL}/clients/${client.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
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
      categoryPages = categories.map((cat) => ({
        url: `${SITE_URL}/use-cases/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    }
  }

  return [...staticPages, ...skillPages, ...clientPages, ...categoryPages]
}
