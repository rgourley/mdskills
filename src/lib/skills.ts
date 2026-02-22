import { createClient } from '@/lib/supabase/server'

export interface Skill {
  id: string
  slug: string
  name: string
  description: string
  owner: string
  repo: string
  skillPath: string
  githubUrl?: string
  weeklyInstalls: number
  tags: string[]
  platforms: string[]
  upvotes?: number
  forksCount?: number
  commentsCount?: number
  updatedAt?: string
  /** ISO 8601 timestamps for structured data / JSON-LD */
  updatedAtIso?: string
  createdAtIso?: string
  skillContent?: string
  /** 'skill' | 'plugin' | 'hybrid' */
  skillType?: string
  hasPlugin?: boolean
  hasExamples?: boolean
  difficulty?: string
  categorySlug?: string
  categoryName?: string
  githubStars?: number
  githubForks?: number
  license?: string
  /** 'skill_pack' | 'mcp_server' | 'workflow_pack' | 'ruleset' | 'openapi_action' | 'extension' | 'template_bundle' | 'plugin' */
  artifactType?: string
  permFilesystemRead?: boolean
  permFilesystemWrite?: boolean
  permShellExec?: boolean
  permNetworkAccess?: boolean
  permGitWrite?: boolean
  /** 'skill_md' | 'agents_md' | 'claude_md' | 'cursorrules' | 'copilot_instructions' | 'gemini_md' | 'clinerules' | 'windsurf_rules' | 'mdc' | 'generic' */
  formatStandard?: string
  /** Project README (overview, installation, how it works) */
  readme?: string
  /** AI-generated review fields */
  reviewSummary?: string
  reviewStrengths?: string[]
  reviewWeaknesses?: string[]
  reviewQualityScore?: number
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
  skill_type?: string | null
  has_plugin?: boolean | null
  has_examples?: boolean | null
  difficulty?: string | null
  category_id?: string | null
  github_stars?: number | null
  github_forks?: number | null
  license?: string | null
  categories?: { slug: string; name: string } | { slug: string; name: string }[] | null
  artifact_type?: string | null
  perm_filesystem_read?: boolean | null
  perm_filesystem_write?: boolean | null
  perm_shell_exec?: boolean | null
  perm_network_access?: boolean | null
  perm_git_write?: boolean | null
  format_standard?: string | null
  readme?: string | null
  review_summary?: string | null
  review_strengths?: string[] | null
  review_weaknesses?: string[] | null
  review_quality_score?: number | null
}

/** Select columns used in detail queries (includes large text fields) */
const SKILL_SELECT = 'id, slug, name, description, owner, repo, skill_path, github_url, weekly_installs, tags, platforms, created_at, updated_at, content, readme, mdskills_upvotes, mdskills_forks, skill_type, has_plugin, has_examples, difficulty, github_stars, github_forks, license, artifact_type, perm_filesystem_read, perm_filesystem_write, perm_shell_exec, perm_network_access, perm_git_write, format_standard, review_summary, review_strengths, review_weaknesses, review_quality_score, categories(slug, name)'

/** Lightweight select for list/card views (excludes content & readme) */
const LIST_SELECT = 'id, slug, name, description, owner, repo, skill_path, github_url, weekly_installs, tags, platforms, created_at, updated_at, mdskills_upvotes, mdskills_forks, skill_type, has_plugin, has_examples, difficulty, github_stars, github_forks, license, artifact_type, format_standard, review_quality_score, categories(slug, name)'

function mapRow(row: SkillRow, commentsCount?: number): Skill {
  // categories comes back as an array from Supabase joins — normalize to single object
  const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
    owner: row.owner,
    repo: row.repo,
    skillPath: row.skill_path,
    githubUrl: row.github_url ?? undefined,
    weeklyInstalls: row.weekly_installs ?? 0,
    tags: row.tags ?? [],
    platforms: row.platforms ?? [],
    upvotes: row.mdskills_upvotes ?? undefined,
    forksCount: row.mdskills_forks ?? undefined,
    commentsCount,
    updatedAt: row.updated_at ? formatRelativeTime(row.updated_at) : undefined,
    updatedAtIso: row.updated_at || undefined,
    createdAtIso: row.created_at || undefined,
    skillContent: row.content ?? undefined,
    skillType: row.skill_type ?? undefined,
    hasPlugin: row.has_plugin ?? undefined,
    hasExamples: row.has_examples ?? undefined,
    difficulty: row.difficulty ?? undefined,
    categorySlug: cat?.slug ?? undefined,
    categoryName: cat?.name ?? undefined,
    githubStars: row.github_stars ?? undefined,
    githubForks: row.github_forks ?? undefined,
    license: row.license ?? undefined,
    artifactType: row.artifact_type ?? undefined,
    permFilesystemRead: row.perm_filesystem_read ?? undefined,
    permFilesystemWrite: row.perm_filesystem_write ?? undefined,
    permShellExec: row.perm_shell_exec ?? undefined,
    permNetworkAccess: row.perm_network_access ?? undefined,
    permGitWrite: row.perm_git_write ?? undefined,
    formatStandard: row.format_standard ?? undefined,
    readme: row.readme ?? undefined,
    reviewSummary: row.review_summary ?? undefined,
    reviewStrengths: row.review_strengths ?? undefined,
    reviewWeaknesses: row.review_weaknesses ?? undefined,
    reviewQualityScore: row.review_quality_score ?? undefined,
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
    .select(LIST_SELECT)
    .or('status.eq.published,status.is.null')
    .order('github_stars', { ascending: false, nullsFirst: false })
    .limit(6)

  if (error || !data?.length) return []
  return data.map((row) => mapRow(row as unknown as SkillRow))
}

/** Most recently added skills */
export async function getLatestSkills(limit = 6): Promise<Skill[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('skills')
    .select(LIST_SELECT)
    .or('status.eq.published,status.is.null')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data?.length) return []
  return data.map((row) => mapRow(row as unknown as SkillRow))
}

export interface GetSkillsOptions {
  query?: string
  tags?: string[]
  categorySlug?: string
  artifactType?: string
  clientSlug?: string
  sort?: 'trending' | 'popular' | 'recent'
  page?: number
  pageSize?: number
}

export interface PaginatedSkills {
  skills: Skill[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const DEFAULT_PAGE_SIZE = 24

export async function getSkills(opts?: GetSkillsOptions): Promise<PaginatedSkills> {
  const supabase = await createClient()
  if (!supabase) return { skills: [], total: 0, page: 1, pageSize: DEFAULT_PAGE_SIZE, totalPages: 0 }

  const page = Math.max(1, opts?.page ?? 1)
  const pageSize = opts?.pageSize ?? DEFAULT_PAGE_SIZE
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let q = supabase
    .from('skills')
    .select(LIST_SELECT, { count: 'exact' })
    .or('status.eq.published,status.is.null')

  if (opts?.query?.trim()) {
    const safe = opts.query.trim().toLowerCase().replace(/,/g, ' ')
    const term = `%${safe}%`
    q = q.or(`name.ilike.${term},description.ilike.${term}`)
  }
  if (opts?.tags?.length) {
    q = q.overlaps('tags', opts.tags)
  }
  if (opts?.artifactType?.trim()) {
    q = q.eq('artifact_type', opts.artifactType.trim())
  }

  // Run sub-queries in parallel if needed (category lookup + client filter)
  const [catId, clientSkillIds] = await Promise.all([
    opts?.categorySlug?.trim()
      ? supabase.from('categories').select('id').eq('slug', opts.categorySlug.trim()).single().then(({ data }) => data?.id ?? null)
      : Promise.resolve(null),
    opts?.clientSlug?.trim()
      ? supabase.from('listing_clients').select('skill_id, clients!inner(slug)').eq('clients.slug', opts.clientSlug.trim()).then(({ data }) => data?.map((r: { skill_id: string }) => r.skill_id) ?? [])
      : Promise.resolve(null),
  ])

  if (catId) q = q.eq('category_id', catId)
  if (clientSkillIds !== null) {
    if (clientSkillIds.length === 0) return { skills: [], total: 0, page, pageSize, totalPages: 0 }
    q = q.in('id', clientSkillIds)
  }

  // Sort
  if (opts?.sort === 'recent') {
    q = q.order('created_at', { ascending: false })
  } else {
    q = q.order('weekly_installs', { ascending: false })
  }

  // Paginate
  q = q.range(from, to)

  const { data, error, count } = await q
  if (error) return { skills: [], total: 0, page, pageSize, totalPages: 0 }
  if (!data?.length) return { skills: [], total: count ?? 0, page, pageSize, totalPages: Math.ceil((count ?? 0) / pageSize) }

  const total = count ?? data.length
  return {
    skills: data.map((row) => mapRow(row as unknown as SkillRow)),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/** Top-reviewed skills by Skill Advisor score */
export async function getTopReviewedSkills(limit = 6): Promise<Skill[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('skills')
    .select(LIST_SELECT)
    .or('status.eq.published,status.is.null')
    .not('review_quality_score', 'is', null)
    .order('review_quality_score', { ascending: false })
    .order('weekly_installs', { ascending: false })
    .limit(limit)

  if (error || !data?.length) return []
  return data.map((row) => mapRow(row as unknown as SkillRow))
}

export async function getPluginSkills(limit = 6): Promise<Skill[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('skills')
    .select(LIST_SELECT)
    .or('status.eq.published,status.is.null')
    .or('has_plugin.eq.true,artifact_type.eq.plugin')
    .order('weekly_installs', { ascending: false })
    .limit(limit)

  if (error || !data?.length) return []
  return data.map((row) => mapRow(row as unknown as SkillRow))
}

const ARTIFACT_TYPE_LABELS: Record<string, string> = {
  skill_pack: 'Agent Skill',
  mcp_server: 'MCP Server',
  workflow_pack: 'Workflow Pack',
  ruleset: 'Rules',
  openapi_action: 'OpenAPI Action',
  extension: 'Extension',
  template_bundle: 'Starter Kit',
  plugin: 'Plugin',
}

/** Returns artifact types that have at least `minCount` published listings */
export async function getArtifactTypesWithListings(minCount = 2): Promise<{ slug: string; name: string }[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('skills')
    .select('artifact_type')
    .or('status.eq.published,status.is.null')

  if (error || !data?.length) return []

  // Count per type
  const counts: Record<string, number> = {}
  for (const row of data) {
    const t = (row as { artifact_type: string | null }).artifact_type || 'skill_pack'
    counts[t] = (counts[t] || 0) + 1
  }

  return Object.entries(counts)
    .filter(([, count]) => count >= minCount)
    .map(([slug]) => ({ slug, name: ARTIFACT_TYPE_LABELS[slug] || slug }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function getSkillBySlug(slug: string): Promise<Skill | null> {
  const supabase = await createClient()
  if (!supabase) return null

  const { data: row, error } = await supabase
    .from('skills')
    .select(SKILL_SELECT)
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

  const skill = mapRow(row as unknown as SkillRow, commentsCount)
  if (!skill.skillContent) {
    skill.skillContent = `# ${skill.name}\n\n## Description\n${skill.description}\n\n## When to Use This Skill\n\nUse this skill when the user needs help with tasks related to this domain.\n\n## Instructions\n\nAdd your instructions here.`
  }
  return skill
}
