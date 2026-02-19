import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api'

/** GET /api/skills — Public skills list/search endpoint */
export async function GET(request: NextRequest) {
  const supabase = createApiClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { searchParams } = request.nextUrl
  const query = searchParams.get('q')
  const category = searchParams.get('category')
  const artifactType = searchParams.get('artifact_type')
  const sort = searchParams.get('sort') || 'popular'
  const limit = Math.min(Number(searchParams.get('limit') || 20), 50)
  const featured = searchParams.get('featured') === 'true'

  // List columns — exclude content and readme (large blobs) for list view
  const LIST_SELECT = 'id, slug, name, description, owner, repo, skill_path, github_url, weekly_installs, tags, platforms, created_at, updated_at, skill_type, has_plugin, difficulty, github_stars, github_forks, license, artifact_type, format_standard, categories(slug, name)'

  let q = supabase
    .from('skills')
    .select(LIST_SELECT)
    .or('status.eq.published,status.is.null')

  if (featured) {
    q = q.eq('featured', true)
  }

  if (query) {
    q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
  }

  if (category) {
    // Join through categories
    q = q.eq('categories.slug', category)
  }

  if (artifactType) {
    q = q.eq('artifact_type', artifactType)
  }

  // Sorting
  switch (sort) {
    case 'trending':
      q = q.order('weekly_installs', { ascending: false })
      break
    case 'recent':
      q = q.order('created_at', { ascending: false })
      break
    default: // popular
      q = q.order('weekly_installs', { ascending: false })
  }

  q = q.limit(limit)

  const { data, error } = await q

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  const skills = (data ?? []).map((row: Record<string, unknown>) => {
    const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories
    return {
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
      updated_at: row.updated_at,
      category: cat ? { slug: (cat as Record<string, unknown>).slug, name: (cat as Record<string, unknown>).name } : null,
    }
  })

  const response = NextResponse.json({ skills, count: skills.length })
  response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  return response
}
