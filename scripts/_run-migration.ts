import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, serviceRoleKey)

async function main() {
  // Test if the column already exists
  const { error } = await supabase.from('skills').select('review_quality_score').limit(1)
  if (!error) {
    console.log('review columns already exist')
    return
  }

  console.log('Columns do not exist yet. Need to add them via Supabase Dashboard SQL Editor.')
  console.log('Run this SQL:\n')
  console.log(`ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS review_summary TEXT;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS review_strengths TEXT[];
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS review_weaknesses TEXT[];
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS review_quality_score INTEGER;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS review_generated_at TIMESTAMPTZ;`)
}

main().catch(console.error)
