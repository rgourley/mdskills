/**
 * Import Claude Code plugins into Supabase.
 * Currently imports: obra/superpowers
 *
 * Usage:
 *   npx tsx scripts/import-plugins.ts                # import all plugins
 *   npx tsx scripts/import-plugins.ts --dry-run      # preview without writing
 */
import 'dotenv/config'
import { importSkill } from '../src/lib/import-skill'

const dryRun = process.argv.includes('--dry-run')

// ── Plugins to import ──────────────────────────────────────────

interface PluginConfig {
  url: string
  slug: string
  name: string
  description: string
  category: string
  artifactType: 'plugin'
  platforms: string[]
  tags: string[]
}

const PLUGINS: PluginConfig[] = [
  {
    url: 'https://github.com/obra/superpowers',
    slug: 'superpowers',
    name: 'Superpowers',
    description: 'An agentic skills framework and software development methodology for Claude Code. Provides composable skills for TDD, debugging, collaboration, and autonomous agent-driven development.',
    category: 'claude-code-plugins',
    artifactType: 'plugin',
    platforms: ['claude-code'],
    tags: ['claude-code', 'plugin', 'tdd', 'debugging', 'skills-framework', 'agents', 'hooks', 'commands'],
  },
]

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔌 Importing ${PLUGINS.length} plugin(s)`)
  console.log('─'.repeat(60))

  if (dryRun) {
    console.log('🔍 DRY RUN — no database writes\n')
  }

  let succeeded = 0
  let failed = 0
  const errors: Array<{ name: string; error: string }> = []

  for (let i = 0; i < PLUGINS.length; i++) {
    const plugin = PLUGINS[i]
    console.log(`\n[${i + 1}/${PLUGINS.length}] ${plugin.name} (${plugin.url})`)

    const result = await importSkill({
      url: plugin.url,
      slug: plugin.slug,
      name: plugin.name,
      category: plugin.category,
      artifactType: plugin.artifactType,
      platforms: plugin.platforms,
      dryRun,
    })

    for (const log of result.logs) {
      console.log(`  ${log}`)
    }

    if (result.success) {
      console.log(`  ✓ Imported: ${result.name} (${result.slug})`)
      succeeded++
    } else {
      console.log(`  ✗ Failed: ${result.error}`)
      errors.push({ name: plugin.name, error: result.error || 'Unknown error' })
      failed++
    }

    // Rate limit between imports
    if (i < PLUGINS.length - 1) {
      await new Promise(r => setTimeout(r, 1000))
    }
  }

  console.log('\n' + '─'.repeat(60))
  console.log(`✅ Import complete!`)
  console.log(`  Succeeded: ${succeeded}`)
  console.log(`  Failed:    ${failed}`)

  if (errors.length > 0) {
    console.log('\nErrors:')
    for (const e of errors) {
      console.log(`  - ${e.name}: ${e.error}`)
    }
  }

  if (dryRun) {
    console.log(`\n🏁 Dry run complete. Remove --dry-run to write to database.`)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
