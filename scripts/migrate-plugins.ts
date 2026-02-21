/**
 * Find skills with has_plugin=true that are still artifact_type='skill_pack'
 * and migrate them to artifact_type='plugin'.
 *
 * Usage:
 *   npx tsx scripts/migrate-plugins.ts              # preview changes
 *   npx tsx scripts/migrate-plugins.ts --apply      # apply changes
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const apply = process.argv.includes('--apply')

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, key)

  // Find all skills with has_plugin=true
  const { data, error } = await supabase
    .from('skills')
    .select('id, slug, name, artifact_type, has_plugin, skill_type')
    .eq('has_plugin', true)
    .or('status.eq.published,status.is.null')
    .order('name')

  if (error) {
    console.error('Query error:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.log('No skills found with has_plugin=true')
    return
  }

  console.log(`\nFound ${data.length} skill(s) with has_plugin=true:\n`)
  console.log('─'.repeat(80))

  const toMigrate = data.filter(s => s.artifact_type === 'skill_pack')
  const alreadyCorrect = data.filter(s => s.artifact_type !== 'skill_pack')

  for (const s of data) {
    const needsMigration = s.artifact_type === 'skill_pack'
    console.log(
      `  ${needsMigration ? '→' : '✓'} ${s.slug.padEnd(40)} artifact_type=${(s.artifact_type || 'null').padEnd(14)} ${needsMigration ? '← needs migration' : '(ok)'}`
    )
  }

  console.log()
  console.log(`  Already correct: ${alreadyCorrect.length}`)
  console.log(`  Need migration:  ${toMigrate.length}`)

  if (toMigrate.length === 0) {
    console.log('\nNothing to migrate!')
    return
  }

  if (!apply) {
    console.log('\nRun with --apply to migrate these to artifact_type=\'plugin\'')
    return
  }

  console.log('\nMigrating...\n')

  let succeeded = 0
  let failed = 0

  for (const s of toMigrate) {
    const { error: updateError } = await supabase
      .from('skills')
      .update({
        artifact_type: 'plugin',
        skill_type: 'plugin',
        has_plugin: false,
      })
      .eq('id', s.id)

    if (updateError) {
      console.log(`  ✗ ${s.slug}: ${updateError.message}`)
      failed++
    } else {
      console.log(`  ✓ ${s.slug}: migrated to artifact_type='plugin'`)
      succeeded++
    }
  }

  console.log(`\nDone! Migrated: ${succeeded}, Failed: ${failed}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
