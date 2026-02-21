/**
 * Import legacy .cursorrules from PatrickJS/awesome-cursorrules rules/ directory.
 * Each subdirectory contains a .cursorrules file (plain text, no frontmatter).
 *
 * Usage:
 *   npx tsx scripts/import-cursorrules-legacy.ts                # import all rules
 *   npx tsx scripts/import-cursorrules-legacy.ts --dry-run      # preview without writing
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
const RULES_DIR = 'rules'

const githubHeaders: Record<string, string> = {
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'mdskills-importer',
  ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
}

// ── Category keyword detection ───────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'code-review': ['code review', 'lint', 'linting', 'eslint', 'prettier', 'code quality', 'static analysis', 'code style', 'clean code', 'code guidelines'],
  'documentation': ['documentation', 'docs', 'readme', 'jsdoc', 'typedoc', 'api docs', 'docstring', 'mkdocs'],
  'testing': ['testing', 'test', 'jest', 'mocha', 'pytest', 'unit test', 'e2e', 'qa', 'playwright', 'cypress', 'vitest', 'gherkin', 'testrail', 'xray', 'defect', 'bug report'],
  'security': ['security', 'vulnerability', 'cve', 'owasp', 'pentest', 'encryption', 'solidity', 'smart contract', 'hardhat', 'foundry'],
  'api-development': ['api', 'rest', 'graphql', 'openapi', 'swagger', 'endpoint', 'webhook', 'grpc', 'fastapi', 'express', 'django', 'flask', 'rails', 'laravel', 'springboot', 'nestjs', 'ktor'],
  'data-analysis': ['data analysis', 'data science', 'analytics', 'pandas', 'scikit-learn', 'pytorch', 'jupyter', 'notebook', 'csv', 'dataset', 'machine learning', 'ml'],
  'productivity': ['productivity', 'automation', 'workflow', 'git', 'commit', 'pr template', 'ticket', 'epic'],
  'design-systems': ['ui', 'component', 'tailwind', 'css', 'react', 'vue', 'svelte', 'angular', 'nextjs', 'nuxt', 'shadcn', 'chakra', 'material-ui', 'styled-components', 'htmx', 'qwik', 'solidjs', 'astro', 'sveltekit', 'frontend'],
  'devops-ci-cd': ['devops', 'ci/cd', 'docker', 'kubernetes', 'terraform', 'github actions', 'deployment', 'infrastructure', 'pipeline', 'aws', 'gcp', 'azure', 'knative', 'istio', 'containerization', 'netlify'],
  'database-design': ['database', 'sql', 'postgres', 'mysql', 'mongodb', 'schema', 'migration', 'orm', 'prisma', 'supabase', 'convex'],
  'code-generation': ['code generation', 'scaffolding', 'boilerplate', 'generator', 'template', 'starter'],
}

function detectCategory(dirName: string, content: string): string | null {
  // Combine directory name (cleaned) + first 1000 chars of content for matching
  const cleanDir = dirName
    .replace(/-cursorrules.*$/i, '')
    .replace(/-prompt-file$/i, '')
    .replace(/[-_]/g, ' ')
    .toLowerCase()
  const text = `${cleanDir} ${content.slice(0, 1500).toLowerCase()}`

  let bestCategory: string | null = null
  let bestScore = 0

  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0
    for (const kw of keywords) {
      if (text.includes(kw)) score++
    }
    if (score > bestScore) {
      bestScore = score
      bestCategory = slug
    }
  }

  return bestScore >= 1 ? bestCategory : null
}

// ── Tag extraction from directory name ───────────────────────────

function extractTags(dirName: string, content: string): string[] {
  const clean = dirName
    .replace(/-cursorrules.*$/i, '')
    .replace(/-prompt-file$/i, '')
    .toLowerCase()

  const tags = new Set<string>()

  // Known technology tokens to extract
  const techTokens: Record<string, string> = {
    'nextjs': 'nextjs', 'next': 'nextjs', 'react': 'react', 'vue': 'vue', 'vue3': 'vue',
    'angular': 'angular', 'svelte': 'svelte', 'sveltekit': 'sveltekit',
    'typescript': 'typescript', 'javascript': 'javascript', 'python': 'python',
    'django': 'django', 'flask': 'flask', 'fastapi': 'fastapi',
    'go': 'go', 'golang': 'go', 'rust': 'rust', 'java': 'java', 'kotlin': 'kotlin',
    'ruby': 'ruby', 'rails': 'rails', 'elixir': 'elixir', 'phoenix': 'phoenix',
    'swift': 'swift', 'swiftui': 'swiftui', 'uikit': 'uikit',
    'flutter': 'flutter', 'dart': 'dart', 'riverpod': 'riverpod',
    'tailwind': 'tailwind', 'shadcn': 'shadcn', 'chakra': 'chakra-ui',
    'nodejs': 'nodejs', 'node': 'nodejs', 'express': 'express', 'deno': 'deno',
    'mongodb': 'mongodb', 'postgres': 'postgres', 'supabase': 'supabase',
    'docker': 'docker', 'kubernetes': 'kubernetes',
    'solidity': 'solidity', 'hardhat': 'hardhat', 'foundry': 'foundry',
    'cypress': 'cypress', 'playwright': 'playwright', 'jest': 'jest', 'vitest': 'vitest',
    'htmx': 'htmx', 'qwik': 'qwik', 'solidjs': 'solidjs', 'astro': 'astro',
    'nuxt': 'nuxt', 'laravel': 'laravel', 'php': 'php', 'drupal': 'drupal',
    'wordpress': 'wordpress', 'graphql': 'graphql', 'grpc': 'grpc',
    'expo': 'expo', 'tauri': 'tauri', 'nativescript': 'nativescript',
    'unity': 'unity', 'cuda': 'cuda', 'webassembly': 'webassembly',
    'firebase': 'firebase', 'vercel': 'vercel', 'netlify': 'netlify',
    'redux': 'redux', 'mobx': 'mobx', 'pinia': 'pinia',
    'springboot': 'spring-boot', 'jpa': 'jpa',
    'material': 'material-ui', 'medusa': 'medusa',
    'convex': 'convex', 'kafka': 'kafka', 'scala': 'scala',
    'salesforce': 'salesforce', 'apex': 'apex',
    'cpp': 'c++', 'r': 'r-lang',
  }

  const parts = clean.split(/[-_ ]+/)
  for (const part of parts) {
    if (techTokens[part]) {
      tags.add(techTokens[part])
    }
  }

  // Add 'cursorrules' as a tag
  tags.add('cursorrules')

  return Array.from(tags).slice(0, 15)
}

// ── Name generation ──────────────────────────────────────────────

const ACRONYMS = new Set([
  'ai', 'api', 'aws', 'ci', 'cd', 'cli', 'cms', 'cpu', 'css', 'csv',
  'db', 'dns', 'dom', 'gcp', 'gpu', 'html', 'http', 'https', 'ide',
  'io', 'ip', 'json', 'jwt', 'llm', 'mcp', 'ml', 'npm', 'os', 'pdf',
  'qa', 'rag', 'rest', 'rpc', 'sdk', 'seo', 'sql', 'ssh', 'ssl',
  'svg', 'tls', 'ui', 'url', 'ux', 'vm', 'xml', 'yaml', 'eeg',
  'grpc', 'jwt', 'pwa', 'dsl', 'gpu', 'cuda',
])

const KNOWN_NAMES: Record<string, string> = {
  'nextjs': 'Next.js', 'reactjs': 'React', 'vuejs': 'Vue.js', 'vue3': 'Vue 3',
  'svelte': 'Svelte', 'sveltekit': 'SvelteKit', 'angular': 'Angular',
  'typescript': 'TypeScript', 'javascript': 'JavaScript', 'python': 'Python',
  'django': 'Django', 'flask': 'Flask', 'fastapi': 'FastAPI',
  'golang': 'Go', 'nodejs': 'Node.js', 'expressjs': 'Express.js',
  'flutter': 'Flutter', 'swiftui': 'SwiftUI', 'uikit': 'UIKit',
  'tailwind': 'Tailwind CSS', 'shadcn': 'shadcn/ui', 'htmx': 'HTMX',
  'graphql': 'GraphQL', 'mongodb': 'MongoDB', 'postgres': 'PostgreSQL',
  'supabase': 'Supabase', 'docker': 'Docker', 'kubernetes': 'Kubernetes',
  'solidity': 'Solidity', 'hardhat': 'Hardhat', 'foundry': 'Foundry',
  'cypress': 'Cypress', 'playwright': 'Playwright', 'jest': 'Jest',
  'expo': 'Expo', 'tauri': 'Tauri', 'nativescript': 'NativeScript',
  'qwik': 'Qwik', 'solidjs': 'SolidJS', 'astro': 'Astro',
  'nuxt': 'Nuxt', 'laravel': 'Laravel', 'drupal': 'Drupal',
  'wordpress': 'WordPress', 'medusa': 'Medusa', 'convex': 'Convex',
  'springboot': 'Spring Boot', 'kotlin': 'Kotlin', 'scala': 'Scala',
  'elixir': 'Elixir', 'phoenix': 'Phoenix', 'ruby': 'Ruby',
  'salesforce': 'Salesforce', 'pyqt6': 'PyQt6', 'riverpod': 'Riverpod',
  'redux': 'Redux', 'mobx': 'MobX', 'pinia': 'Pinia',
  'vercel': 'Vercel', 'netlify': 'Netlify', 'firebase': 'Firebase',
  'deno': 'Deno', 'dragonruby': 'DragonRuby',
}

function generateDisplayName(dirName: string): string {
  const clean = dirName
    .replace(/-cursorrules.*$/i, '')
    .replace(/-prompt-file$/i, '')
    .replace(/-prompt$/i, '')

  return clean
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(w => w.length > 0)
    .map(w => {
      const lower = w.toLowerCase()
      if (KNOWN_NAMES[lower]) return KNOWN_NAMES[lower]
      if (ACRONYMS.has(lower)) return w.toUpperCase()
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    })
    .join(' ')
}

function generateSlug(dirName: string): string {
  const clean = dirName
    .replace(/-cursorrules.*$/i, '')
    .replace(/-prompt-file$/i, '')
    .replace(/-prompt$/i, '')

  return ('cursor-' + clean)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function extractDescription(content: string, displayName: string): string {
  if (!content.trim()) return `${displayName} rules and best practices for Cursor`

  // Try to extract from "You are an expert in..." pattern
  const expertMatch = content.match(/^[\s*/-]*You are an (?:expert|AI)[^.]*\./m)
  if (expertMatch) {
    return expertMatch[0].replace(/^[\s*/-]+/, '').slice(0, 500)
  }

  // Try first heading content
  const headingMatch = content.match(/^#\s+(.+)/m)
  if (headingMatch) {
    return headingMatch[1].trim().slice(0, 500)
  }

  // Try first meaningful line
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 20)
  if (lines.length > 0) {
    return lines[0].replace(/^[-*#]+\s*/, '').slice(0, 500)
  }

  return `${displayName} rules and best practices for Cursor`
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

// ── Category ID lookup ───────────────────────────────────────────

async function getCategoryId(slug: string): Promise<string | null> {
  const { data } = await supabase.from('categories').select('id').eq('slug', slug).single()
  return data?.id ?? null
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log(`\n📦 Importing legacy .cursorrules from ${OWNER}/${REPO}/${RULES_DIR}`)
  console.log('─'.repeat(60))

  if (dryRun) {
    console.log('🔍 DRY RUN — no database writes\n')
  }

  // 1. Fetch repo metadata
  const repoRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}`, { headers: githubHeaders })
  const repoData = repoRes.ok ? await repoRes.json() : null
  const repoStars = repoData?.stargazers_count ?? 0
  const repoForks = repoData?.forks_count ?? 0
  const repoLicense = repoData?.license?.spdx_id ?? null
  console.log(`  Repo: ${repoStars} stars, ${repoForks} forks, license: ${repoLicense || 'none'}`)

  // 2. Discover all directories via Git Trees API
  console.log('\n📋 Discovering rule directories...')
  const treeRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`,
    { headers: githubHeaders }
  )
  if (!treeRes.ok) {
    console.error(`✗ Git Trees API failed: ${treeRes.status}`)
    process.exit(1)
  }
  const treeData = await treeRes.json()

  // Find all .cursorrules files under rules/
  const ruleFiles = (treeData.tree as { path: string; type: string }[])
    .filter(item =>
      item.type === 'blob' &&
      item.path.startsWith(`${RULES_DIR}/`) &&
      item.path.endsWith('.cursorrules')
    )
    .map(item => ({
      path: item.path,
      dirName: item.path.replace(`${RULES_DIR}/`, '').replace('/.cursorrules', ''),
    }))
    .sort((a, b) => a.dirName.localeCompare(b.dirName))

  console.log(`  Found ${ruleFiles.length} .cursorrules files\n`)

  // 3. Pre-fetch all category IDs
  const categoryCache: Record<string, string | null> = {}
  const uniqueCategories = Object.keys(CATEGORY_KEYWORDS)
  for (const catSlug of uniqueCategories) {
    categoryCache[catSlug] = await getCategoryId(catSlug)
  }

  let succeeded = 0
  let failed = 0
  let skipped = 0
  const errors: Array<{ dir: string; error: string }> = []
  const pad = String(ruleFiles.length).length

  for (let i = 0; i < ruleFiles.length; i++) {
    const { path, dirName } = ruleFiles[i]
    const slug = generateSlug(dirName)
    const displayName = generateDisplayName(dirName)

    process.stdout.write(`  [${String(i + 1).padStart(pad)}/${ruleFiles.length}] ${slug}... `)

    try {
      // Fetch the .cursorrules file
      const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`
      const res = await fetch(url, { headers: { 'User-Agent': 'mdskills-importer' } })
      if (!res.ok) {
        console.log('⚠ not found, skipping')
        skipped++
        continue
      }
      const content = await res.text()

      // Skip empty files
      if (!content.trim()) {
        console.log('⚠ empty, skipping')
        skipped++
        continue
      }

      const description = extractDescription(content, displayName)
      const permissions = detectPermissions(content)
      const categorySlug = detectCategory(dirName, content)
      const categoryId = categorySlug ? (categoryCache[categorySlug] ?? null) : null
      const tags = extractTags(dirName, content)
      const githubUrl = `https://github.com/${OWNER}/${REPO}/tree/${BRANCH}/${RULES_DIR}/${dirName}`
      const platforms = ['cursor']

      if (dryRun) {
        console.log(`✓ ${displayName}`)
        console.log(`      cat: ${categorySlug || '(none)'} | tags: ${tags.join(', ')}`)
        succeeded++
        continue
      }

      const record = {
        slug,
        name: displayName,
        description: description.slice(0, 500),
        owner: OWNER,
        repo: REPO,
        skill_path: `${RULES_DIR}/${dirName}`,
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
        format_standard: 'cursorrules',
        ...permissions,
      }

      const { data, error } = await supabase
        .from('skills')
        .upsert(record, { onConflict: 'slug' })
        .select('id, slug, name')
        .single()

      if (error) {
        console.log(`✗ ${error.message}`)
        failed++
        errors.push({ dir: dirName, error: error.message })
        continue
      }

      // Link to clients
      if (data.id) {
        const clientSlugs = ['cursor', 'claude-code']
        for (const clientSlug of clientSlugs) {
          const { data: client } = await supabase
            .from('clients')
            .select('id')
            .eq('slug', clientSlug)
            .single()
          if (client) {
            await supabase.from('listing_clients').upsert(
              {
                skill_id: data.id,
                client_id: client.id,
                install_instructions: `npx mdskills install ${OWNER}/${slug}`,
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
      errors.push({ dir: dirName, error: msg })
    }

    // Rate limiting
    if (i < ruleFiles.length - 1) {
      await new Promise(r => setTimeout(r, 150))
    }
  }

  // Summary
  console.log('\n' + '─'.repeat(60))
  console.log(`✅ Import complete!`)
  console.log(`  Succeeded: ${succeeded}`)
  console.log(`  Skipped:   ${skipped} (empty or not found)`)
  console.log(`  Failed:    ${failed}`)
  console.log(`  Total:     ${ruleFiles.length}`)

  if (errors.length > 0) {
    console.log(`\n⚠ Errors:`)
    for (const e of errors.slice(0, 20)) {
      console.log(`  ${e.dir}: ${e.error}`)
    }
    if (errors.length > 20) {
      console.log(`  ... and ${errors.length - 20} more`)
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
