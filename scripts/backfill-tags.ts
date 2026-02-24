/**
 * Backfill auto-parsed tags for all existing skills.
 * Merges new extracted tags with existing tags (additive — never removes).
 *
 * Usage:
 *   npx tsx scripts/backfill-tags.ts              # dry run
 *   npx tsx scripts/backfill-tags.ts --apply       # write to DB
 *   npx tsx scripts/backfill-tags.ts --slug unity-mcp --apply  # single skill
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { extractTagsFromContent } from '../src/lib/extract-tags'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)
const apply = process.argv.includes('--apply')
const slugIndex = process.argv.indexOf('--slug')
const targetSlug = slugIndex !== -1 ? process.argv[slugIndex + 1] : null

async function main() {
  console.log(apply ? '🔧 APPLY MODE — will update database' : '👀 DRY RUN — pass --apply to write changes')
  if (targetSlug) console.log(`🎯 SINGLE SKILL — slug: ${targetSlug}`)
  console.log('')

  // Fetch skills
  let query = supabase
    .from('skills')
    .select('id, slug, repo, name, description, readme, tags')
    .or('status.eq.published,status.is.null')

  if (targetSlug) {
    query = query.eq('slug', targetSlug)
  }

  const { data: skills, error } = await query

  if (error) {
    console.error('Failed to fetch skills:', error.message)
    process.exit(1)
  }

  if (!skills?.length) {
    console.log('No skills found.')
    return
  }

  console.log(`Processing ${skills.length} skill(s)...\n`)

  let updated = 0
  let unchanged = 0

  for (const skill of skills) {
    const existingTags: string[] = skill.tags || []
    const extracted = extractTagsFromContent(
      skill.repo || '',
      skill.description || '',
      skill.readme || null,
    )

    // Merge: keep existing + add new (additive only)
    const merged = Array.from(new Set([
      ...existingTags,
      ...extracted,
    ])).slice(0, 15)

    // Find which tags are new
    const existingSet = new Set(existingTags)
    const newTags = merged.filter(t => !existingSet.has(t))

    if (newTags.length === 0) {
      unchanged++
      continue
    }

    console.log(`  ✓ ${(skill.slug as string).padEnd(40)} +${newTags.length} tags: [${newTags.join(', ')}]`)

    if (apply) {
      const { error: updateError } = await supabase
        .from('skills')
        .update({ tags: merged })
        .eq('id', skill.id)

      if (updateError) {
        console.error(`    DB error: ${updateError.message}`)
      }
    }
    updated++
  }

  console.log(`\n${apply ? '✅ Updated' : '📋 Would update'}: ${updated} skills`)
  console.log(`⏭  Unchanged: ${unchanged} skills (no new tags found)`)
  if (!apply && updated > 0) {
    console.log('\nRun with --apply to write changes:')
    console.log('  npx tsx scripts/backfill-tags.ts --apply')
  }
}

main().catch(console.error)
