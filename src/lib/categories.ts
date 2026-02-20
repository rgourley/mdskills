import { createClient } from '@/lib/supabase/server'

export interface Category {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  sortOrder: number
  skillCount?: number
}

interface CategoryRow {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  sort_order: number
}

function mapCategoryRow(row: CategoryRow, skillCount?: number): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
    icon: row.icon ?? undefined,
    sortOrder: row.sort_order ?? 0,
    skillCount,
  }
}

/** Fetch all categories with skill counts (use for Use Cases page, NOT for filter sidebar) */
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name, description, icon, sort_order')
    .order('sort_order', { ascending: true })

  if (error || !data?.length) return []

  // Get skill counts per category — parallel queries instead of sequential N+1
  const categories = data as CategoryRow[]
  const counts = await Promise.all(
    categories.map((cat) =>
      supabase
        .from('skills')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', cat.id)
        .or('status.eq.published,status.is.null')
    )
  )

  return categories.map((cat, i) => mapCategoryRow(cat, counts[i].count ?? 0))
}

/** Lightweight: just slugs and names in a single query. Use for filter sidebar. */
export async function getCategoriesLight(): Promise<Category[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name, description, icon, sort_order')
    .order('sort_order', { ascending: true })

  if (error || !data?.length) return []
  return (data as CategoryRow[]).map((row) => mapCategoryRow(row))
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name, description, icon, sort_order')
    .eq('slug', slug)
    .single()

  if (error || !data) return null

  const { count } = await supabase
    .from('skills')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', data.id)
    .or('status.eq.published,status.is.null')

  return mapCategoryRow(data as CategoryRow, count ?? 0)
}
