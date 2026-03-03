/**
 * Business logic for user skill submissions and admin review.
 */
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// ── Types ──────────────────────────────────────────────────────

export type SubmissionStatus = 'draft' | 'pending_review' | 'in_review' | 'published' | 'rejected'

export type ReviewTier = 'standard' | 'priority' | 'featured'

export interface Submission {
  id: string
  slug: string
  name: string
  description: string
  status: SubmissionStatus
  artifactType: string
  formatStandard?: string
  githubUrl?: string
  content?: string
  categorySlug?: string
  categoryName?: string
  rejectionReason?: string
  submittedAt?: string
  createdAt: string
  updatedAt: string
  reviewQualityScore?: number
  reviewTier: ReviewTier
  submitterEmail?: string
  submitterName?: string
}

export interface CreateSubmissionData {
  artifactType: string
  sourceType: 'github' | 'markdown'
  githubUrl?: string
  content?: string
  name: string
  description?: string
  categorySlug?: string
  formatStandard?: string
}

// ── Helpers ──────────────────────────────────────────────────────

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

const SUBMISSION_SELECT = `
  id, slug, name, description, status, artifact_type, format_standard,
  github_url, content, category_id, rejection_reason, submitted_at,
  created_at, updated_at, review_quality_score, review_tier, submitted_by,
  categories(slug, name)
`

function mapSubmission(row: any): Submission {
  const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
    status: row.status as SubmissionStatus,
    artifactType: row.artifact_type ?? 'skill_pack',
    formatStandard: row.format_standard ?? undefined,
    githubUrl: row.github_url ?? undefined,
    content: row.content ?? undefined,
    categorySlug: cat?.slug ?? undefined,
    categoryName: cat?.name ?? undefined,
    rejectionReason: row.rejection_reason ?? undefined,
    submittedAt: row.submitted_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reviewQualityScore: row.review_quality_score ?? undefined,
    reviewTier: (row.review_tier as ReviewTier) || 'standard',
    submitterEmail: row.submitter_email ?? undefined,
    submitterName: row.submitter_name ?? undefined,
  }
}

// Detect platforms based on artifact type and format standard
function detectPlatformsSimple(artifactType: string, formatStandard?: string): string[] {
  const MCP_CLIENTS = [
    'claude-code', 'claude-desktop', 'cursor', 'vscode-copilot', 'windsurf',
    'continue-dev', 'gemini-cli', 'amp', 'roo-code', 'goose',
  ]
  const MARKDOWN_CLIENTS = [
    'claude-code', 'claude-desktop', 'cursor', 'vscode-copilot', 'windsurf',
    'continue-dev', 'codex', 'gemini-cli', 'amp', 'roo-code', 'goose',
    'opencode', 'trae', 'qodo', 'command-code',
  ]
  const FORMAT_SPECIFIC_CLIENTS: Record<string, string[]> = {
    cursorrules: ['cursor'],
    mdc: ['cursor'],
    claude_md: ['claude-code', 'claude-desktop'],
    copilot_instructions: ['vscode-copilot', 'github'],
    gemini_md: ['gemini', 'gemini-cli'],
    windsurf_rules: ['windsurf'],
    clinerules: ['roo-code'],
  }

  if (formatStandard && FORMAT_SPECIFIC_CLIENTS[formatStandard]) {
    return FORMAT_SPECIFIC_CLIENTS[formatStandard]
  }
  if (artifactType === 'mcp_server') return [...MCP_CLIENTS]
  return [...MARKDOWN_CLIENTS]
}

// Detect permissions from content
function detectPermissions(content: string) {
  const lower = content.toLowerCase()
  return {
    perm_filesystem_read: /read|file|fs|path|directory|folder/i.test(lower),
    perm_filesystem_write: /write|create|save|output|generate.*file/i.test(lower),
    perm_shell_exec: /exec|command|shell|bash|terminal|npm|npx|pip/i.test(lower),
    perm_network_access: /fetch|http|api|url|request|download|curl/i.test(lower),
    perm_git_write: /git push|git commit|git add/i.test(lower),
  }
}

// ── User-facing functions ──────────────────────────────────────

/** Create a new draft submission */
export async function createSubmission(userId: string, data: CreateSubmissionData): Promise<{ success: boolean; id?: string; slug?: string; error?: string }> {
  const supabase = getServiceClient()
  if (!supabase) return { success: false, error: 'Database unavailable' }

  // If GitHub URL, use importSkill for metadata extraction
  if (data.sourceType === 'github' && data.githubUrl) {
    try {
      const { importSkill } = await import('@/lib/import-skill')
      const result = await importSkill({
        url: data.githubUrl,
        name: data.name || undefined,
        category: data.categorySlug || undefined,
        artifactType: data.artifactType || undefined,
        formatStandard: data.formatStandard || undefined,
        // User submission overrides
        submittedBy: userId,
        status: 'draft',
        skipReview: true,
        skipClientLinking: true,
      })

      if (!result.success) {
        return { success: false, error: result.error || 'Import failed' }
      }
      return { success: true, id: result.id, slug: result.slug }
    } catch (err: any) {
      return { success: false, error: err.message || 'Import failed' }
    }
  }

  // Markdown paste submission
  const slug = generateSlug(data.name)
  const content = data.content || ''
  const platforms = detectPlatformsSimple(data.artifactType, data.formatStandard)
  const permissions = content ? detectPermissions(content) : {}

  // Resolve category ID
  let categoryId: string | null = null
  if (data.categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', data.categorySlug)
      .single()
    categoryId = cat?.id ?? null
  }

  // Ensure slug is unique
  const { data: existing } = await supabase
    .from('skills')
    .select('slug')
    .eq('slug', slug)
    .single()

  const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug

  const record = {
    slug: finalSlug,
    name: data.name,
    description: data.description || `${data.name} — an AI agent skill.`,
    owner: '',
    repo: '',
    skill_path: '',
    github_url: null,
    content,
    status: 'draft',
    featured: false,
    artifact_type: data.artifactType,
    format_standard: data.formatStandard || 'skill_md',
    category_id: categoryId,
    submitted_by: userId,
    platforms,
    tags: [],
    weekly_installs: 0,
    mdskills_upvotes: 0,
    mdskills_forks: 0,
    ...permissions,
  }

  const { data: inserted, error } = await supabase
    .from('skills')
    .insert(record)
    .select('id, slug')
    .single()

  if (error) {
    return { success: false, error: `Database error: ${error.message}` }
  }

  return { success: true, id: inserted.id, slug: inserted.slug }
}

/** Submit a draft for review */
export async function submitForReview(userId: string, skillId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getServiceClient()
  if (!supabase) return { success: false, error: 'Database unavailable' }

  // Verify ownership and draft status
  const { data: skill } = await supabase
    .from('skills')
    .select('id, submitted_by, status, name, content')
    .eq('id', skillId)
    .single()

  if (!skill) return { success: false, error: 'Skill not found' }
  if (skill.submitted_by !== userId) return { success: false, error: 'Not your submission' }
  if (skill.status !== 'draft' && skill.status !== 'rejected') {
    return { success: false, error: 'Can only submit drafts or rejected skills for review' }
  }

  // Validate minimum content
  if (!skill.name || skill.name.trim().length < 3) {
    return { success: false, error: 'Name is required (at least 3 characters)' }
  }

  const { error } = await supabase
    .from('skills')
    .update({
      status: 'pending_review',
      submitted_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq('id', skillId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

/** Get a user's own submissions */
export async function getUserSubmissions(userId: string): Promise<Submission[]> {
  const supabase = getServiceClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('skills')
    .select(SUBMISSION_SELECT)
    .eq('submitted_by', userId)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data.map(mapSubmission)
}

/** Update a user's own draft/rejected submission */
export async function updateSubmission(
  userId: string,
  skillId: string,
  updates: Partial<{
    name: string
    description: string
    content: string
    categorySlug: string
    artifactType: string
    formatStandard: string
  }>
): Promise<{ success: boolean; error?: string }> {
  const supabase = getServiceClient()
  if (!supabase) return { success: false, error: 'Database unavailable' }

  // Verify ownership and editable status
  const { data: skill } = await supabase
    .from('skills')
    .select('id, submitted_by, status')
    .eq('id', skillId)
    .single()

  if (!skill) return { success: false, error: 'Skill not found' }
  if (skill.submitted_by !== userId) return { success: false, error: 'Not your submission' }
  if (skill.status !== 'draft' && skill.status !== 'rejected') {
    return { success: false, error: 'Can only edit drafts or rejected submissions' }
  }

  const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() }
  if (updates.name) dbUpdates.name = updates.name
  if (updates.description) dbUpdates.description = updates.description
  if (updates.content !== undefined) dbUpdates.content = updates.content
  if (updates.artifactType) dbUpdates.artifact_type = updates.artifactType
  if (updates.formatStandard) dbUpdates.format_standard = updates.formatStandard

  if (updates.categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', updates.categorySlug)
      .single()
    if (cat) dbUpdates.category_id = cat.id
  }

  // If re-editing a rejected submission, reset status to draft
  if (skill.status === 'rejected') {
    dbUpdates.status = 'draft'
    dbUpdates.rejection_reason = null
  }

  const { error } = await supabase
    .from('skills')
    .update(dbUpdates)
    .eq('id', skillId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

/** Delete a user's own draft */
export async function deleteSubmission(userId: string, skillId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getServiceClient()
  if (!supabase) return { success: false, error: 'Database unavailable' }

  const { data: skill } = await supabase
    .from('skills')
    .select('id, submitted_by, status')
    .eq('id', skillId)
    .single()

  if (!skill) return { success: false, error: 'Skill not found' }
  if (skill.submitted_by !== userId) return { success: false, error: 'Not your submission' }

  // Users can delete their own submissions in any non-published state
  const deletableStatuses = ['draft', 'pending_review', 'in_review', 'rejected']
  if (!deletableStatuses.includes(skill.status)) {
    return { success: false, error: 'Published listings cannot be deleted. Contact support.' }
  }

  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', skillId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ── Admin functions ──────────────────────────────────────────────

/** Get the admin review queue */
export async function getReviewQueue(): Promise<Submission[]> {
  const supabase = getServiceClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('skills')
    .select(SUBMISSION_SELECT)
    .in('status', ['pending_review', 'in_review'])
    .order('submitted_at', { ascending: true })

  if (error || !data) return []

  // Fetch submitter info from public.users table separately
  let submissions = data.map(mapSubmission)
  const userIds = Array.from(new Set(data.map((r: any) => r.submitted_by).filter(Boolean)))

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, email, name')
      .in('id', userIds)

    if (users) {
      const userMap = new Map(users.map((u: any) => [u.id, u]))
      for (let i = 0; i < submissions.length; i++) {
        const userId = data[i].submitted_by
        const user = userId ? userMap.get(userId) : null
        if (user) {
          submissions[i].submitterEmail = user.email
          submissions[i].submitterName = user.name
        }
      }
    }
  }

  // Sort by tier priority: featured > priority > standard
  const tierOrder: Record<string, number> = { featured: 0, priority: 1, standard: 2 }
  submissions = submissions.sort((a, b) => (tierOrder[a.reviewTier] ?? 2) - (tierOrder[b.reviewTier] ?? 2))

  return submissions
}

/** Admin: Approve a submission (publish + generate review + link clients) */
export async function approveSubmission(skillId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getServiceClient()
  if (!supabase) return { success: false, error: 'Database unavailable' }

  const { data: skill, error: fetchError } = await supabase
    .from('skills')
    .select('*, categories(slug, name)')
    .eq('id', skillId)
    .single()

  if (fetchError || !skill) return { success: false, error: 'Skill not found' }

  // Update status to published
  const { error: updateError } = await supabase
    .from('skills')
    .update({
      status: 'published',
      rejection_reason: null,
    })
    .eq('id', skillId)

  if (updateError) return { success: false, error: updateError.message }

  // Generate AI review
  if (process.env.ANTHROPIC_API_KEY && skill.content) {
    try {
      const { generateSkillReview } = await import('@/lib/generate-review')
      const review = await generateSkillReview(
        skill.content,
        skill.readme,
        {
          filesystemRead: skill.perm_filesystem_read,
          filesystemWrite: skill.perm_filesystem_write,
          shellExec: skill.perm_shell_exec,
          networkAccess: skill.perm_network_access,
          gitWrite: skill.perm_git_write,
        },
        undefined,
        skill.artifact_type,
        skill.format_standard
      )
      if (review) {
        await supabase
          .from('skills')
          .update({
            review_summary: review.summary,
            review_strengths: review.strengths,
            review_weaknesses: review.weaknesses,
            review_quality_score: review.quality_score,
            review_generated_at: new Date().toISOString(),
          })
          .eq('id', skillId)
      }
    } catch {
      // Review generation failed — not fatal
    }
  }

  // Link to clients
  const platforms = skill.platforms || []
  if (!platforms.includes('claude-code')) platforms.unshift('claude-code')

  for (const clientSlug of platforms) {
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('slug', clientSlug)
      .single()

    if (client) {
      const artifactType = skill.artifact_type || 'skill_pack'
      let instructions: string
      if (artifactType === 'plugin') {
        instructions = `/plugin install ${skill.owner}/${skill.repo}`
      } else if (artifactType === 'mcp_server') {
        if (clientSlug === 'claude-code') {
          instructions = `claude mcp add ${skill.slug} -- npx -y ${skill.repo}`
        } else {
          instructions = `npx -y ${skill.repo}`
        }
      } else {
        instructions = `npx mdskills install ${skill.owner || 'mdskills'}/${skill.slug}`
      }

      await supabase.from('listing_clients').upsert(
        {
          skill_id: skillId,
          client_id: client.id,
          install_instructions: instructions,
          is_primary: clientSlug === 'claude-code',
        },
        { onConflict: 'skill_id,client_id' }
      )
    }
  }

  return { success: true }
}

/** Admin: Reject a submission */
export async function rejectSubmission(skillId: string, reason: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getServiceClient()
  if (!supabase) return { success: false, error: 'Database unavailable' }

  const { error } = await supabase
    .from('skills')
    .update({
      status: 'rejected',
      rejection_reason: reason,
    })
    .eq('id', skillId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
