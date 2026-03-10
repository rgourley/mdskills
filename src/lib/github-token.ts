import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/** Store or update a user's GitHub access token */
export async function storeGitHubToken(userId: string, token: string): Promise<void> {
  const supabase = getServiceClient()
  if (!supabase) return

  await supabase
    .from('user_github_tokens')
    .upsert(
      { user_id: userId, access_token: token, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
}

/** Retrieve a user's GitHub access token (returns null if not found or user uses Google login) */
export async function getUserGitHubToken(userId: string): Promise<string | null> {
  const supabase = getServiceClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('user_github_tokens')
    .select('access_token')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data.access_token
}

/** Validate a GitHub token by making a lightweight API call */
export async function validateGitHubToken(token: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'mdskills-importer',
      },
    })
    return res.ok
  } catch {
    return false
  }
}
