/**
 * Parse the VoltAgent/awesome-agent-skills README and batch import missing skills.
 *
 * Usage:
 *   npx tsx scripts/import-awesome-list.ts              # dry run
 *   npx tsx scripts/import-awesome-list.ts --apply       # import all missing
 *   npx tsx scripts/import-awesome-list.ts --apply --limit 10  # import first 10 missing
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'child_process'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)
const apply = process.argv.includes('--apply')
const limitIdx = process.argv.indexOf('--limit')
const limit = limitIdx !== -1 ? parseInt(process.argv[limitIdx + 1], 10) : Infinity

const README_URL = 'https://raw.githubusercontent.com/VoltAgent/awesome-agent-skills/main/README.md'

interface AwesomeEntry {
  name: string
  url: string
  description: string
}

/** Parse a GitHub URL into owner/repo/subpath */
function parseGithubUrl(url: string): { owner: string; repo: string; subpath?: string } | null {
  // Normalize: blob→tree, strip trailing slashes
  let cleaned = url.replace(/\.git$/, '').replace(/\/$/, '')
  cleaned = cleaned.replace(/\/blob\//, '/tree/')

  const match = cleaned.match(/github\.com\/([^/]+)\/([^/]+?)(?:\/tree\/[^/]+\/(.+))?$/)
  if (!match) return null
  return { owner: match[1], repo: match[2], subpath: match[3] }
}

/** Build a dedup key from owner/repo/subpath */
function dedupKey(owner: string, repo: string, skillPath?: string): string {
  const path = (skillPath || '')
    .replace(/\/SKILL\.md$/i, '')
    .replace(/\/README\.md$/i, '')
    .replace(/^\//, '')
  return `${owner.toLowerCase()}/${repo.toLowerCase()}/${path}`.replace(/\/+$/, '')
}

async function main() {
  console.log(apply ? '🔧 APPLY MODE — will import to database' : '👀 DRY RUN — pass --apply to import')
  if (limit < Infinity) console.log(`📊 LIMIT: ${limit} imports`)
  console.log('')

  // 1. Fetch the README
  console.log('📥 Fetching awesome-agent-skills README...')
  const res = await fetch(README_URL)
  if (!res.ok) {
    console.error(`Failed to fetch README: ${res.status}`)
    process.exit(1)
  }
  const readme = await res.text()
  console.log(`  ✓ ${readme.length} bytes\n`)

  // 2. Parse entries
  const entryRegex = /- \*\*\[([^\]]+)\]\((https:\/\/github\.com\/[^)]+)\)\*\*\s*-\s*(.+)/g
  const entries: AwesomeEntry[] = []
  let match
  while ((match = entryRegex.exec(readme)) !== null) {
    entries.push({ name: match[1], url: match[2], description: match[3].trim() })
  }
  console.log(`📋 Parsed ${entries.length} entries from README\n`)

  // 3. Fetch existing skills for dedup (paginated — Supabase defaults to 1000 rows)
  console.log('📦 Fetching existing skills for dedup...')
  let existingSkills: any[] = []
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data, error } = await supabase
      .from('skills')
      .select('slug, owner, repo, skill_path, github_url')
      .range(from, from + PAGE - 1)
    if (error) {
      console.error('Failed to fetch existing skills:', error.message)
      process.exit(1)
    }
    existingSkills = existingSkills.concat(data || [])
    if (!data || data.length < PAGE) break
    from += PAGE
  }

  const existingKeys = new Set<string>()
  const existingUrls = new Set<string>()
  for (const s of existingSkills || []) {
    existingKeys.add(dedupKey(s.owner, s.repo, s.skill_path))
    if (s.github_url) existingUrls.add(s.github_url.toLowerCase())
  }
  console.log(`  ✓ ${existingKeys.size} existing skills\n`)

  // 4. Filter to missing entries
  const missing: AwesomeEntry[] = []
  const skipped: string[] = []

  for (const entry of entries) {
    const parsed = parseGithubUrl(entry.url)
    if (!parsed) {
      skipped.push(`${entry.name} (unparseable URL)`)
      continue
    }

    const key = dedupKey(parsed.owner, parsed.repo, parsed.subpath)
    if (existingKeys.has(key) || existingUrls.has(entry.url.toLowerCase())) {
      continue // Already imported
    }
    missing.push(entry)
  }

  console.log(`📊 Results:`)
  console.log(`  Existing: ${entries.length - missing.length - skipped.length}`)
  console.log(`  Missing:  ${missing.length}`)
  console.log(`  Skipped:  ${skipped.length}`)
  if (skipped.length > 0) {
    for (const s of skipped) console.log(`    ⚠ ${s}`)
  }
  console.log('')

  if (missing.length === 0) {
    console.log('✅ All skills already imported!')
    return
  }

  const toImport = missing.slice(0, limit)
  console.log(`${apply ? '🚀 Importing' : '📋 Would import'} ${toImport.length} skills:\n`)

  let succeeded = 0
  let failed = 0

  for (let i = 0; i < toImport.length; i++) {
    const entry = toImport[i]
    const prefix = `  [${i + 1}/${toImport.length}]`

    if (!apply) {
      console.log(`${prefix} ${entry.name} → ${entry.url}`)
      succeeded++
      continue
    }

    try {
      console.log(`${prefix} Importing ${entry.name}...`)
      const result = execFileSync('npx', ['tsx', 'scripts/import-from-github.ts', entry.url], {
        cwd: process.cwd(),
        timeout: 60000,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      })

      // Check if it succeeded
      if (result.includes('✅ Done!') || result.includes('Saved:')) {
        const slugMatch = result.match(/slug:\s+(\S+)/)
        console.log(`${prefix} ✓ ${entry.name}${slugMatch ? ` → ${slugMatch[1]}` : ''}`)
        succeeded++
      } else {
        console.log(`${prefix} ⚠ ${entry.name} (may have partially imported)`)
        succeeded++
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      // Check stderr for common issues
      if (msg.includes('No SKILL.md') || msg.includes('README')) {
        console.log(`${prefix} ⚠ ${entry.name} (no SKILL.md, imported from README)`)
        succeeded++
      } else {
        console.log(`${prefix} ✗ ${entry.name} — ${msg.slice(0, 100)}`)
        failed++
      }
    }

    // Rate limit delay
    if (i < toImport.length - 1) {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  console.log(`\n${apply ? '✅ Imported' : '📋 Would import'}: ${succeeded}`)
  if (failed > 0) console.log(`✗ Failed: ${failed}`)
  if (!apply && succeeded > 0) {
    console.log('\nRun with --apply to import:')
    console.log('  npx tsx scripts/import-awesome-list.ts --apply')
  }
}

main().catch(console.error)
