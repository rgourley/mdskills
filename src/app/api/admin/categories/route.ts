import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function isAuthorized(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!adminKey) return false
  const cookie = request.cookies.get('admin_token')
  return cookie?.value === adminKey
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const { data } = await supabase
    .from('categories')
    .select('slug, name')
    .order('sort_order', { ascending: true })

  return NextResponse.json(data ?? [])
}
