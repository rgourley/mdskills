import { createClient } from '@/lib/supabase/server'

export interface Skill {
  id: string
  slug: string
  name: string
  description: string
  owner: string
  repo: string
  skillPath: string
  weeklyInstalls: number
  tags: string[]
  platforms: string[]
  upvotes?: number
  forksCount?: number
  commentsCount?: number
  updatedAt?: string
  skillContent?: string
}

/** DB row shape (snake_case) */
interface SkillRow {
  id: string
  slug: string
  name: string
  description: string | null
  owner: string
  repo: string
  skill_path: string
  github_url: string | null
  weekly_installs: number
  tags: string[]
  platforms: string[]
  created_at: string
  updated_at: string
  content: string | null
  mdskills_upvotes: number | null
  mdskills_forks: number | null
}

function mapRow(row: SkillRow, commentsCount?: number): Skill {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
    owner: row.owner,
    repo: row.repo,
    skillPath: row.skill_path,
    weeklyInstalls: row.weekly_installs ?? 0,
    tags: row.tags ?? [],
    platforms: row.platforms ?? [],
    upvotes: row.mdskills_upvotes ?? undefined,
    forksCount: row.mdskills_forks ?? undefined,
    commentsCount,
    updatedAt: row.updated_at ? formatRelativeTime(row.updated_at) : undefined,
    skillContent: row.content ?? undefined,
  }
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const sec = (now.getTime() - date.getTime()) / 1000
  if (sec < 60) return 'just now'
  if (sec < 3600) return `${Math.floor(sec / 60)} minutes ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)} hours ago`
  if (sec < 86400 * 7) return `${Math.floor(sec / 86400)} days ago`
  if (sec < 86400 * 30) return `${Math.floor(sec / 86400 / 7)} weeks ago`
  return date.toLocaleDateString()
}

export async function getFeaturedSkills(): Promise<Skill[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('skills')
    .select('id, slug, name, description, owner, repo, skill_path, github_url, weekly_installs, tags, platforms, created_at, updated_at, content, mdskills_upvotes, mdskills_forks')
    .or('status.eq.published,status.is.null')
    .order('featured', { ascending: false })
    .order('weekly_installs', { ascending: false })
    .limit(6)

  if (error || !data?.length) return []
  return data.map((row) => mapRow(row as SkillRow))
}

export async function getSkills(query?: string, tags?: string[]): Promise<Skill[]> {
  const supabase = await createClient()
  if (!supabase) return []

  let q = supabase
    .from('skills')
    .select('id, slug, name, description, owner, repo, skill_path, github_url, weekly_installs, tags, platforms, created_at, updated_at, content, mdskills_upvotes, mdskills_forks')
    .or('status.eq.published,status.is.null')
    .order('weekly_installs', { ascending: false })

  if (query?.trim()) {
    const safe = query.trim().toLowerCase().replace(/,/g, ' ')
    const term = `%${safe}%`
    q = q.or(`name.ilike.${term},description.ilike.${term}`)
  }
  if (tags?.length) {
    q = q.overlaps('tags', tags)
  }

  const { data, error } = await q
  if (error) return []
  if (!data?.length) return []
  return data.map((row) => mapRow(row as SkillRow))
}

export async function getSkillBySlug(slug: string): Promise<Skill | null> {
  const supabase = await createClient()
  if (!supabase) return null

  const { data: row, error } = await supabase
    .from('skills')
    .select('id, slug, name, description, owner, repo, skill_path, github_url, weekly_installs, tags, platforms, created_at, updated_at, content, mdskills_upvotes, mdskills_forks')
    .eq('slug', slug)
    .or('status.eq.published,status.is.null')
    .single()

  if (error || !row) return null

  let commentsCount: number | undefined
  const { count } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('skill_id', row.id)
  commentsCount = count ?? 0

  const skill = mapRow(row as SkillRow, commentsCount)
  if (!skill.skillContent) {
    skill.skillContent = `# ${skill.name}\n\n## Description\n${skill.description}\n\n## When to Use This Skill\n\nUse this skill when the user needs help with tasks related to this domain.\n\n## Instructions\n\nAdd your instructions here.`
  }
  return skill
}
