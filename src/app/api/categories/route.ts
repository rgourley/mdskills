import { NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api'

/** GET /api/categories — Public categories list */
export async function GET() {
  const supabase = createApiClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('categories')
    .select('slug, name, description, icon')
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  const response = NextResponse.json(data ?? [])
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  return response
}
