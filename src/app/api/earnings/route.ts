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

  // Query the creator_earnings view
  const { data: earnings, error } = await supabase
    .from('creator_earnings')
    .select('skill_id, skill_name, skill_slug, total_sales, total_earnings_cents, total_platform_fees_cents')
    .eq('creator_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const skills = (earnings || []).map((e: any) => ({
    skillId: e.skill_id,
    skillName: e.skill_name,
    skillSlug: e.skill_slug,
    totalSales: e.total_sales,
    totalEarningsCents: e.total_earnings_cents,
    totalPlatformFeesCents: e.total_platform_fees_cents,
  }))

  const totalEarningsCents = skills.reduce((sum: number, s: any) => sum + s.totalEarningsCents, 0)
  const totalSales = skills.reduce((sum: number, s: any) => sum + s.totalSales, 0)

  return NextResponse.json({
    skills,
    totalEarningsCents,
    totalSales,
  })
}
