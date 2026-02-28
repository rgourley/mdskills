import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'

// Simple check endpoint — returns 200 if admin, 401 if not
export async function GET() {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ success: true, email: admin.email })
}
