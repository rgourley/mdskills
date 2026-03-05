/**
 * Supabase Storage helpers for paid skill file management.
 *
 * Bucket: skill-files (private)
 * Path convention: {user_id}/{skill_id}/{filename}
 */
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'skill-files'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// ── Upload to Storage ──────────────────────────────────────────────

export async function uploadToStorage(
  userId: string,
  skillId: string,
  content: Buffer | string,
  fileName: string,
  contentType: string
): Promise<{ path: string } | { error: string }> {
  const supabase = getServiceClient()
  if (!supabase) return { error: 'Storage not configured' }

  const storagePath = `${userId}/${skillId}/${fileName}`

  const fileBody =
    typeof content === 'string' ? new Blob([content], { type: contentType }) : content

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBody, {
      contentType,
      upsert: true,
    })

  if (error) {
    console.error('Storage upload error:', error.message)
    return { error: error.message }
  }

  return { path: storagePath }
}

// ── Generate signed download URL ───────────────────────────────────

export async function createSignedDownloadUrl(
  storagePath: string,
  expiresInSeconds: number = 3600
): Promise<{ url: string; expiresAt: string } | { error: string }> {
  const supabase = getServiceClient()
  if (!supabase) return { error: 'Storage not configured' }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds, { download: true })

  if (error || !data?.signedUrl) {
    console.error('Signed URL error:', error?.message)
    return { error: error?.message || 'Failed to create download URL' }
  }

  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString()
  return { url: data.signedUrl, expiresAt }
}

// ── Pull GitHub repo to Storage ────────────────────────────────────

export async function pullGitHubRepoToStorage(
  owner: string,
  repo: string,
  userId: string,
  skillId: string
): Promise<{ path: string } | { error: string }> {
  const token = process.env.GITHUB_TOKEN
  if (!token) return { error: 'GitHub token not configured' }

  try {
    // Download zip archive from GitHub
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/zipball`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
        redirect: 'follow',
      }
    )

    if (!res.ok) {
      return { error: `GitHub API error: ${res.status} ${res.statusText}` }
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    const fileName = `${repo}.zip`

    return uploadToStorage(userId, skillId, buffer, fileName, 'application/zip')
  } catch (err: any) {
    console.error('GitHub repo pull error:', err.message)
    return { error: err.message || 'Failed to pull GitHub repo' }
  }
}

// ── Upload markdown content as a file ──────────────────────────────

export async function uploadMarkdownToStorage(
  userId: string,
  skillId: string,
  markdownContent: string,
  fileName: string = 'SKILL.md'
): Promise<{ path: string } | { error: string }> {
  return uploadToStorage(userId, skillId, markdownContent, fileName, 'text/markdown')
}
