import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

async function main() {
  const slug = process.argv[2]
  if (!slug) { console.error('Usage: npx tsx scripts/_check-skill.ts <slug>'); process.exit(1) }

  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data } = await s.from('skills').select('slug, name, artifact_type, skill_type, has_plugin, owner, repo, skill_path, github_url, description, tags, format_standard').eq('slug', slug).single()
  console.log(JSON.stringify(data, null, 2))
}
main()
