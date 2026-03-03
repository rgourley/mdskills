import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { getReviewQueue } from '@/lib/submissions'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const queue = await getReviewQueue()
  return NextResponse.json(queue)
}
