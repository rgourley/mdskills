import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { approveSubmission, rejectSubmission } from '@/lib/submissions'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { action, rejectionReason } = body

    if (action === 'approve') {
      const result = await approveSubmission(id)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'reject') {
      if (!rejectionReason || typeof rejectionReason !== 'string' || rejectionReason.trim().length < 5) {
        return NextResponse.json(
          { error: 'Rejection reason is required (at least 5 characters)' },
          { status: 400 }
        )
      }
      const result = await rejectSubmission(id, rejectionReason.trim())
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
