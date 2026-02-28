import { createClient } from '@/lib/supabase/server'

/**
 * Check if the current request is from an authenticated admin user.
 * Returns the user if admin, null otherwise.
 */
export async function getAdminUser() {
  const supabase = await createClient()
  if (!supabase) return null

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  // Check role in public.users
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return null

  return user
}
