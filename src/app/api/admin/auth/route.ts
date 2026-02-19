import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    const adminKey = process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!adminKey) {
      return NextResponse.json({ error: 'Admin not configured' }, { status: 500 })
    }

    if (password !== adminKey) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Set an httpOnly cookie with the admin token
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', adminKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
