import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { data: purchases, error } = await supabase
    .from('purchases')
    .select(`
      id,
      amount,
      currency,
      purchased_at,
      skill_id,
      skills (
        id,
        slug,
        name,
        description,
        artifact_type,
        source_file_path
      )
    `)
    .eq('user_id', user.id)
    .order('purchased_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const mapped = (purchases || []).map((p: any) => {
    const skill = Array.isArray(p.skills) ? p.skills[0] : p.skills
    return {
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      purchasedAt: p.purchased_at,
      skill: skill
        ? {
            id: skill.id,
            slug: skill.slug,
            name: skill.name,
            description: skill.description,
            artifactType: skill.artifact_type,
            hasDownload: !!skill.source_file_path,
          }
        : null,
    }
  })

  return NextResponse.json({ purchases: mapped })
}
