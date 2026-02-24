/**
 * Generate AI reviews for skills that don't yet have one.
 *
 * Usage:
 *   npx tsx scripts/generate-reviews.ts              # dry run (missing reviews only)
 *   npx tsx scripts/generate-reviews.ts --apply       # write to DB
 *   npx tsx scripts/generate-reviews.ts --all --apply # regenerate ALL reviews
 *   npx tsx scripts/generate-reviews.ts --slug some-skill --apply  # single skill
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { generateSkillReview } from '../src/lib/generate-review'

// Force override so .env values win over empty shell vars
const parsed = config({ override: true }).parsed || {}
const supabaseUrl = parsed.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = parsed.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
const anthropicApiKey = parsed.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
if (!anthropicApiKey) {
  console.error('Missing ANTHROPIC_API_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)
const apply = process.argv.includes('--apply')
const regenerateAll = process.argv.includes('--all')
const slugIndex = process.argv.indexOf('--slug')
const targetSlug = slugIndex !== -1 ? process.argv[slugIndex + 1] : null

const DELAY_MS = 500

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log(apply ? 'APPLY MODE — will update database' : 'DRY RUN — pass --apply to write changes')
  if (regenerateAll) console.log('REGENERATE ALL — will overwrite existing reviews')
  if (targetSlug) console.log(`SINGLE SKILL — slug: ${targetSlug}`)
  console.log('')

  // Fetch skills to process (paginated — Supabase defaults to 1000 rows)
  const COLS = 'id, slug, name, content, readme, artifact_type, format_standard, perm_filesystem_read, perm_filesystem_write, perm_shell_exec, perm_network_access, perm_git_write'
  let skills: any[] = []

  if (targetSlug) {
    const { data, error } = await supabase.from('skills').select(COLS).eq('slug', targetSlug)
    if (error) { console.error('Failed to fetch skills:', error.message); process.exit(1) }
    skills = data || []
  } else {
    let from = 0
    const PAGE = 1000
    while (true) {
      let query = supabase.from('skills').select(COLS)
        .or('status.eq.published,status.is.null')
        .not('content', 'is', null)
      if (!regenerateAll) {
        query = query.is('review_generated_at', null)
      }
      query = query.order('weekly_installs', { ascending: false, nullsFirst: false })
        .range(from, from + PAGE - 1)
      const { data, error } = await query
      if (error) { console.error('Failed to fetch skills:', error.message); process.exit(1) }
      skills = skills.concat(data || [])
      if (!data || data.length < PAGE) break
      from += PAGE
    }
  }

  if (!skills.length) {
    console.log('No skills need reviews.')
    return
  }

  console.log(`Processing ${skills.length} skill(s)...\n`)

  let succeeded = 0
  let failed = 0

  for (const skill of skills) {
    if (!skill.content || skill.content.length < 50) {
      console.log(`  - ${(skill.slug as string).padEnd(40)} (content too short, skipped)`)
      failed++
      continue
    }

    const review = await generateSkillReview(
      skill.content as string,
      (skill.readme as string) || null,
      {
        filesystemRead: skill.perm_filesystem_read as boolean,
        filesystemWrite: skill.perm_filesystem_write as boolean,
        shellExec: skill.perm_shell_exec as boolean,
        networkAccess: skill.perm_network_access as boolean,
        gitWrite: skill.perm_git_write as boolean,
      },
      anthropicApiKey,
      (skill.artifact_type as string) || undefined,
      (skill.format_standard as string) || undefined,
    )

    if (!review) {
      console.log(`  x ${(skill.slug as string).padEnd(40)} (generation failed)`)
      failed++
    } else {
      console.log(`  v ${(skill.slug as string).padEnd(40)} score=${review.quality_score}/10  "${review.summary.slice(0, 60)}..."`)

      if (review.strengths.length > 0) {
        for (const s of review.strengths) {
          console.log(`    + ${s}`)
        }
      }
      if (review.weaknesses.length > 0) {
        for (const w of review.weaknesses) {
          console.log(`    - ${w}`)
        }
      }

      if (apply) {
        const { error: updateError } = await supabase
          .from('skills')
          .update({
            review_summary: review.summary,
            review_strengths: review.strengths,
            review_weaknesses: review.weaknesses,
            review_quality_score: review.quality_score,
            review_generated_at: new Date().toISOString(),
          })
          .eq('id', skill.id)

        if (updateError) {
          console.error(`    DB error: ${updateError.message}`)
        }
      }
      succeeded++
    }

    await sleep(DELAY_MS)
  }

  console.log(`\n${apply ? 'Updated' : 'Would update'}: ${succeeded} skills`)
  if (failed > 0) console.log(`Failed/skipped: ${failed} skills`)
  if (!apply && succeeded > 0) {
    console.log('\nRun with --apply to write changes:')
    console.log('  npx tsx scripts/generate-reviews.ts --apply')
  }
}

main().catch(console.error)
