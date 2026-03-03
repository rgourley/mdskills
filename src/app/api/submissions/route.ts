import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserSubmissions } from '@/lib/submissions'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const submissions = await getUserSubmissions(user.id)
  return NextResponse.json(submissions)
}
