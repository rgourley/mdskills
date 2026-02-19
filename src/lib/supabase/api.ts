import { createClient } from '@supabase/supabase-js'

/** Lightweight Supabase client for public API routes (no cookie auth needed) */
export function createApiClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}
