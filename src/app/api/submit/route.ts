import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSubmission } from '@/lib/submissions'

export async function POST(request: Request) {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { artifactType, sourceType, githubUrl, content, name, description, categorySlug, formatStandard, isPaid, priceAmount, sourceFilePath } = body

    // Validation
    if (!artifactType || typeof artifactType !== 'string') {
      return NextResponse.json({ error: 'artifactType is required' }, { status: 400 })
    }
    if (!sourceType || !['github', 'markdown', 'upload'].includes(sourceType)) {
      return NextResponse.json({ error: 'sourceType must be "github", "markdown", or "upload"' }, { status: 400 })
    }
    if (sourceType === 'github' && (!githubUrl || typeof githubUrl !== 'string')) {
      return NextResponse.json({ error: 'githubUrl is required for GitHub submissions' }, { status: 400 })
    }
    if (sourceType === 'markdown' && (!name || typeof name !== 'string' || name.trim().length < 3)) {
      return NextResponse.json({ error: 'name is required (at least 3 characters)' }, { status: 400 })
    }
    if (sourceType === 'upload' && (!sourceFilePath || typeof sourceFilePath !== 'string')) {
      return NextResponse.json({ error: 'sourceFilePath is required for file uploads' }, { status: 400 })
    }

    // Price validation for paid skills
    if (isPaid) {
      if (!priceAmount || typeof priceAmount !== 'number' || priceAmount < 100 || priceAmount > 99900) {
        return NextResponse.json({ error: 'Price must be between $1 and $999' }, { status: 400 })
      }
    }

    // MCP servers, plugins, tools, and extensions require GitHub URL or upload
    const githubOnlyTypes = ['mcp_server', 'plugin', 'extension', 'tool']
    if (githubOnlyTypes.includes(artifactType) && sourceType === 'markdown') {
      return NextResponse.json(
        { error: `${artifactType} submissions require a GitHub URL or file upload` },
        { status: 400 }
      )
    }

    const result = await createSubmission(user.id, {
      artifactType,
      sourceType,
      githubUrl: githubUrl || undefined,
      content: content || undefined,
      name: name || '',
      description: description || undefined,
      categorySlug: categorySlug || undefined,
      formatStandard: formatStandard || undefined,
      isPaid: isPaid || false,
      priceAmount: isPaid ? priceAmount : undefined,
      sourceFilePath: sourceFilePath || undefined,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, id: result.id, slug: result.slug })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
