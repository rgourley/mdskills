/**
 * Import cursor rules from PatrickJS/awesome-cursorrules repo.
 * Each .mdc file in rules-new/ becomes its own rule entry.
 *
 * Usage:
 *   npx tsx scripts/import-cursorrules.ts                # import all rules
 *   npx tsx scripts/import-cursorrules.ts --dry-run      # preview without writing
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const githubToken = process.env.GITHUB_TOKEN

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)
const dryRun = process.argv.includes('--dry-run')

const OWNER = 'PatrickJS'
const REPO = 'awesome-cursorrules'
const BRANCH = 'main'
const RULES_DIR = 'rules-new'

const githubHeaders: Record<string, string> = {
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'mdskills-importer',
  ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
}

// ── MDC files to import ──────────────────────────────────────────

const MDC_FILES = [
  'beefreeSDK.mdc',
  'clean-code.mdc',
  'codequality.mdc',
  'cpp.mdc',
  'database.mdc',
  'fastapi.mdc',
  'gitflow.mdc',
  'medusa.mdc',
  'nativescript.mdc',
  'nextjs.mdc',
  'node-express.mdc',
  'python.mdc',
  'react.mdc',
  'rust.mdc',
  'svelte.mdc',
  'tailwind.mdc',
  'typescript.mdc',
  'vue.mdc',
]

// ── Category mapping ─────────────────────────────────────────────
// Map each rule file to the best-matching category slug.
// These were manually matched based on the rule content and available categories.

const CATEGORY_MAP: Record<string, string | null> = {
  'beefreeSDK.mdc': 'design-systems',         // UI SDK / component integration
  'clean-code.mdc': 'code-review',            // code quality / review practices
  'codequality.mdc': 'code-review',           // code quality guidelines
  'cpp.mdc': 'code-generation',               // C++ coding standards
  'database.mdc': 'database-design',          // Prisma / Supabase database
  'fastapi.mdc': 'api-development',           // Python API framework
  'gitflow.mdc': 'devops-ci-cd',              // git workflow / branching
  'medusa.mdc': 'api-development',            // Medusa e-commerce backend
  'nativescript.mdc': 'design-systems',        // mobile UI framework
  'nextjs.mdc': 'design-systems',             // Next.js / frontend
  'node-express.mdc': 'api-development',       // Node backend
  'python.mdc': 'code-generation',            // Python coding standards
  'react.mdc': 'design-systems',              // React frontend
  'rust.mdc': 'code-generation',              // Rust / Solana coding standards
  'svelte.mdc': 'design-systems',             // Svelte frontend
  'tailwind.mdc': 'design-systems',           // CSS / UI styling
  'typescript.mdc': 'code-generation',         // TypeScript coding standards
  'vue.mdc': 'design-systems',                // Vue frontend
}

// ── Display names ────────────────────────────────────────────────

const DISPLAY_NAMES: Record<string, string> = {
  'beefreeSDK.mdc': 'Beefree SDK',
  'clean-code.mdc': 'Clean Code',
  'codequality.mdc': 'Code Quality',
  'cpp.mdc': 'C++ Programming',
  'database.mdc': 'Database Design',
  'fastapi.mdc': 'FastAPI',
  'gitflow.mdc': 'Gitflow Workflow',
  'medusa.mdc': 'Medusa',
  'nativescript.mdc': 'NativeScript',
  'nextjs.mdc': 'Next.js',
  'node-express.mdc': 'Node.js & Express',
  'python.mdc': 'Python',
  'react.mdc': 'React',
  'rust.mdc': 'Rust & Solana',
  'svelte.mdc': 'Svelte',
  'tailwind.mdc': 'Tailwind CSS',
  'typescript.mdc': 'TypeScript',
  'vue.mdc': 'Vue.js',
}

// ── Tags per rule ────────────────────────────────────────────────

const TAGS_MAP: Record<string, string[]> = {
  'beefreeSDK.mdc': ['beefree', 'sdk', 'email', 'react', 'typescript'],
  'clean-code.mdc': ['clean-code', 'best-practices', 'refactoring', 'code-quality'],
  'codequality.mdc': ['code-quality', 'best-practices', 'guidelines'],
  'cpp.mdc': ['c++', 'cpp', 'cmake', 'systems-programming'],
  'database.mdc': ['database', 'prisma', 'supabase', 'sql', 'orm'],
  'fastapi.mdc': ['python', 'fastapi', 'api', 'rest', 'backend'],
  'gitflow.mdc': ['git', 'gitflow', 'branching', 'version-control', 'devops'],
  'medusa.mdc': ['medusa', 'ecommerce', 'typescript', 'react'],
  'nativescript.mdc': ['nativescript', 'mobile', 'ios', 'android', 'typescript'],
  'nextjs.mdc': ['nextjs', 'react', 'typescript', 'tailwind', 'app-router'],
  'node-express.mdc': ['nodejs', 'express', 'api', 'backend', 'javascript'],
  'python.mdc': ['python', 'flask', 'sqlite', 'backend'],
  'react.mdc': ['react', 'hooks', 'typescript', 'frontend', 'components'],
  'rust.mdc': ['rust', 'solana', 'anchor', 'blockchain', 'smart-contracts'],
  'svelte.mdc': ['svelte', 'sveltekit', 'frontend', 'typescript'],
  'tailwind.mdc': ['tailwind', 'css', 'ui', 'responsive', 'design'],
  'typescript.mdc': ['typescript', 'types', 'coding-standards', 'best-practices'],
  'vue.mdc': ['vue', 'pinia', 'composition-api', 'typescript', 'frontend'],
}

// ── Helpers ──────────────────────────────────────────────────────

async function fetchRaw(path: string): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'mdskills-importer' } })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

interface MdcFrontmatter {
  description: string
  globs: string
  body: string
}

function parseMdcFrontmatter(content: string): MdcFrontmatter {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { description: '', globs: '', body: content }

  const fmBlock = match[1]
  const body = match[2]

  const raw: Record<string, string> = {}
  for (const line of fmBlock.split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/)
    if (kv) {
      raw[kv[1]] = kv[2].trim()
    }
  }

  return {
    description: raw.description || '',
    globs: raw.globs || '',
    body,
  }
}

function generateSlug(filename: string): string {
  return 'cursor-' + filename
    .replace(/\.mdc$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function detectPermissions(content: string) {
  const lower = content.toLowerCase()
  return {
    perm_filesystem_read: /read|file|fs|path|directory|folder/i.test(lower),
    perm_filesystem_write: /write|create|save|output|generate.*file/i.test(lower),
    perm_shell_exec: /exec|command|shell|bash|terminal|npm|npx|pip/i.test(lower),
    perm_network_access: /fetch|http|api|url|request|download|curl/i.test(lower),
    perm_git_write: /git push|git commit|git add/i.test(lower),
  }
}

async function getCategoryId(slug: string): Promise<string | null> {
  const { data } = await supabase.from('categories').select('id').eq('slug', slug).single()
  return data?.id ?? null
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log(`\n📦 Importing ${MDC_FILES.length} cursor rules from ${OWNER}/${REPO}`)
  console.log('─'.repeat(60))

  if (dryRun) {
    console.log('🔍 DRY RUN — no database writes\n')
  }

  // Fetch repo metadata
  const repoRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}`, { headers: githubHeaders })
  const repoData = repoRes.ok ? await repoRes.json() : null
  const repoStars = repoData?.stargazers_count ?? 0
  const repoForks = repoData?.forks_count ?? 0
  const repoLicense = repoData?.license?.spdx_id ?? null

  console.log(`  Repo: ${repoStars} stars, ${repoForks} forks, license: ${repoLicense || 'none'}\n`)

  // Pre-fetch all category IDs
  const categoryCache: Record<string, string | null> = {}
  const uniqueCategories = [...new Set(Object.values(CATEGORY_MAP).filter(Boolean))] as string[]
  for (const catSlug of uniqueCategories) {
    categoryCache[catSlug] = await getCategoryId(catSlug)
  }

  let succeeded = 0
  let failed = 0
  const errors: Array<{ file: string; error: string }> = []

  for (let i = 0; i < MDC_FILES.length; i++) {
    const filename = MDC_FILES[i]
    const slug = generateSlug(filename)
    const displayName = DISPLAY_NAMES[filename] || filename.replace('.mdc', '')

    process.stdout.write(`  [${String(i + 1).padStart(2)}/${MDC_FILES.length}] ${slug}... `)

    try {
      // Fetch the .mdc file
      const content = await fetchRaw(`${RULES_DIR}/${filename}`)
      if (!content) {
        console.log('⚠ not found, skipping')
        failed++
        errors.push({ file: filename, error: 'File not found' })
        continue
      }

      const fm = parseMdcFrontmatter(content)
      const description = (fm.description || `${displayName} best practices and coding rules for Cursor`).slice(0, 500)
      const permissions = detectPermissions(content)
      const categorySlug = CATEGORY_MAP[filename]
      const categoryId = categorySlug ? (categoryCache[categorySlug] ?? null) : null
      const tags = TAGS_MAP[filename] || []
      const githubUrl = `https://github.com/${OWNER}/${REPO}/blob/${BRANCH}/${RULES_DIR}/${filename}`

      // Platforms: .mdc format is Cursor-specific, but the content is generic enough
      // for any markdown-consuming client
      const platforms = ['cursor']

      if (dryRun) {
        console.log(`✓ ${displayName}`)
        console.log(`      desc: ${description.slice(0, 80)}...`)
        console.log(`      category: ${categorySlug || '(none)'} → ${categoryId || '(not found)'}`)
        console.log(`      tags: ${tags.join(', ')}`)
        console.log(`      platforms: ${platforms.join(', ')}`)
        succeeded++
        continue
      }

      const record = {
        slug,
        name: displayName,
        description,
        owner: OWNER,
        repo: REPO,
        skill_path: `${RULES_DIR}/${filename}`,
        github_url: githubUrl,
        content,
        readme: content,
        status: 'published' as const,
        featured: false,
        skill_type: 'skill',
        has_plugin: false,
        has_examples: false,
        difficulty: 'intermediate' as const,
        category_id: categoryId,
        author_username: OWNER,
        github_stars: repoStars,
        github_forks: repoForks,
        license: repoLicense,
        weekly_installs: 0,
        mdskills_upvotes: 0,
        mdskills_forks: 0,
        platforms,
        tags,
        artifact_type: 'ruleset',
        format_standard: 'mdc',
        ...permissions,
      }

      // Upsert
      const { data, error } = await supabase
        .from('skills')
        .upsert(record, { onConflict: 'slug' })
        .select('id, slug, name')
        .single()

      if (error) {
        console.log(`✗ ${error.message}`)
        failed++
        errors.push({ file: filename, error: error.message })
        continue
      }

      // Link to clients
      if (data.id) {
        const clientSlugs = [...platforms]
        if (!clientSlugs.includes('claude-code')) clientSlugs.unshift('claude-code')

        for (const clientSlug of clientSlugs) {
          const { data: client } = await supabase
            .from('clients')
            .select('id')
            .eq('slug', clientSlug)
            .single()

          if (client) {
            const instructions = `npx mdskills install ${OWNER}/${slug}`
            await supabase.from('listing_clients').upsert(
              {
                skill_id: data.id,
                client_id: client.id,
                install_instructions: instructions,
                is_primary: clientSlug === 'cursor',
              },
              { onConflict: 'skill_id,client_id' }
            )
          }
        }
      }

      console.log(`✓ ${data.name}`)
      succeeded++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`✗ ${msg}`)
      failed++
      errors.push({ file: filename, error: msg })
    }

    // Small delay between imports
    if (i < MDC_FILES.length - 1) {
      await new Promise(r => setTimeout(r, 200))
    }
  }

  // Summary
  console.log('\n' + '─'.repeat(60))
  console.log(`✅ Import complete!`)
  console.log(`  Succeeded: ${succeeded}`)
  console.log(`  Failed:    ${failed}`)
  console.log(`  Total:     ${MDC_FILES.length}`)

  if (errors.length > 0) {
    console.log(`\n⚠ Errors:`)
    for (const e of errors) {
      console.log(`  ${e.file}: ${e.error}`)
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
