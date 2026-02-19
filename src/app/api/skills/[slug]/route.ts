import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api'

/** GET /api/skills/:slug — Public skill detail endpoint (includes content + clients) */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createApiClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { slug } = params

  // Fetch skill with all fields
  const { data: row, error } = await supabase
    .from('skills')
    .select('id, slug, name, description, owner, repo, skill_path, github_url, weekly_installs, tags, platforms, created_at, updated_at, content, readme, skill_type, has_plugin, difficulty, github_stars, github_forks, license, artifact_type, format_standard, perm_filesystem_read, perm_filesystem_write, perm_shell_exec, perm_network_access, perm_git_write, categories(slug, name)')
    .eq('slug', slug)
    .or('status.eq.published,status.is.null')
    .single()

  if (error || !row) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
  }

  // Fetch client install instructions
  const { data: clientRows } = await supabase
    .from('listing_clients')
    .select('install_instructions, is_primary, clients(slug, name)')
    .eq('skill_id', row.id)

  const clients = (clientRows ?? []).map((r: Record<string, unknown>) => {
    const c = r.clients as Record<string, unknown> | null
    return {
      client_slug: c?.slug,
      client_name: c?.name,
      install_instructions: r.install_instructions,
      is_primary: r.is_primary,
    }
  })

  const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories

  const skill = {
    slug: row.slug,
    name: row.name,
    description: row.description,
    owner: row.owner,
    repo: row.repo,
    skill_path: row.skill_path,
    github_url: row.github_url,
    weekly_installs: row.weekly_installs,
    tags: row.tags,
    platforms: row.platforms,
    artifact_type: row.artifact_type,
    format_standard: row.format_standard,
    skill_type: row.skill_type,
    github_stars: row.github_stars,
    github_forks: row.github_forks,
    license: row.license,
    content: row.content,
    readme: row.readme,
    updated_at: row.updated_at,
    category: cat ? { slug: (cat as Record<string, unknown>).slug, name: (cat as Record<string, unknown>).name } : null,
    clients,
    permissions: {
      filesystem_read: row.perm_filesystem_read ?? false,
      filesystem_write: row.perm_filesystem_write ?? false,
      shell_exec: row.perm_shell_exec ?? false,
      network_access: row.perm_network_access ?? false,
      git_write: row.perm_git_write ?? false,
    },
  }

  const response = NextResponse.json({ skill })
  response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  return response
}
