import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadToStorage } from '@/lib/storage'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'

const limiter = createRateLimiter({ windowMs: 60_000, max: 10 })

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
  'text/markdown',
  'text/plain',
]

export async function POST(request: NextRequest) {
  // Rate limit
  const ip = getClientIp(request)
  if (limiter.check(ip)) {
    return NextResponse.json({ error: 'Too many uploads. Try again later.' }, { status: 429 })
  }

  // Auth
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` },
        { status: 400 }
      )
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith('.md') && !file.name.endsWith('.zip')) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: .zip, .md, .txt' },
        { status: 400 }
      )
    }

    // Generate a unique ID for this upload (skill ID may not exist yet)
    const uploadId = crypto.randomUUID()
    const buffer = Buffer.from(await file.arrayBuffer())

    const result = await uploadToStorage(
      user.id,
      uploadId,
      buffer,
      file.name,
      file.type || 'application/octet-stream'
    )

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      storagePath: result.path,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
