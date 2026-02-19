/**
 * Import a skill from any GitHub repo URL.
 *
 * Usage:
 *   npx tsx scripts/import-from-github.ts https://github.com/owner/repo
 *   npx tsx scripts/import-from-github.ts https://github.com/owner/repo --slug my-custom-slug
 *   npx tsx scripts/import-from-github.ts https://github.com/owner/repo --category design-systems
 *   npx tsx scripts/import-from-github.ts https://github.com/owner/repo --platforms claude-code,cursor,codex
 *   npx tsx scripts/import-from-github.ts https://github.com/owner/repo --dry-run
 *
 * What it does:
 *   1. Parses the GitHub URL to extract owner/repo
 *   2. Fetches repo metadata (stars, forks, license, topics, description)
 *   3. Searches for SKILL.md in common locations
 *   4. Fetches README.md
 *   5. Parses frontmatter for name/description
 *   6. Auto-detects platforms, tags, permissions from content
 *   7. Upserts the skill into Supabase
 *   8. Links to default clients
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 * Optional: GITHUB_TOKEN for higher rate limits
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

// ── Helpers ──────────────────────────────────────────────────────

function parseGithubUrl(url: string): { owner: string; repo: string; subpath?: string } {
  // Handle URLs like:
  //   https://github.com/owner/repo
  //   https://github.com/owner/repo/tree/main/some/path
  //   github.com/owner/repo
  //   owner/repo
  const cleaned = url.replace(/\.git$/, '').replace(/\/$/, '')

  // Try full URL
  const urlMatch = cleaned.match(/github\.com\/([^/]+)\/([^/]+?)(?:\/tree\/[^/]+\/(.+))?$/)
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2], subpath: urlMatch[3] }
  }

  // Try owner/repo shorthand
  const shortMatch = cleaned.match(/^([^/]+)\/([^/]+)$/)
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2] }
  }

  throw new Error(`Cannot parse GitHub URL: ${url}`)
}

function parseArgs(args: string[]): {
  url: string
  slug?: string
  category?: string
  platforms?: string[]
  artifactType?: string
  dryRun: boolean
  list: boolean
  name?: string
} {
  const url = args.find((a) => !a.startsWith('--'))
  if (!url) {
    console.error('Usage: npx tsx scripts/import-from-github.ts <github-url> [options]')
    console.error('')
    console.error('Options:')
    console.error('  --slug <slug>           Custom slug (default: auto-generated)')
    console.error('  --name <name>           Custom display name')
    console.error('  --category <slug>       Category slug (e.g., design-systems, code-generation)')
    console.error('  --platforms <list>       Comma-separated platforms (default: auto-detect)')
    console.error('  --type <type>           Artifact type: skill_pack, mcp_server, ruleset, etc.')
    console.error('  --dry-run               Show what would be imported without writing to DB')
    console.error('  --list                  List all SKILL.md files found in the repo')
    console.error('')
    console.error('Examples:')
    console.error('  npx tsx scripts/import-from-github.ts https://github.com/owner/repo')
    console.error('  npx tsx scripts/import-from-github.ts https://github.com/owner/repo/tree/main/skills/pdf')
    console.error('  npx tsx scripts/import-from-github.ts owner/repo --category code-generation --dry-run')
    console.error('  npx tsx scripts/import-from-github.ts owner/mono-repo --list')
    process.exit(1)
  }

  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag)
    return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined
  }

  return {
    url,
    slug: getArg('--slug'),
    name: getArg('--name'),
    category: getArg('--category'),
    platforms: getArg('--platforms')?.split(','),
    artifactType: getArg('--type'),
    dryRun: args.includes('--dry-run'),
    list: args.includes('--list'),
  }
}

const githubHeaders: Record<string, string> = {
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'mdskills-importer',
  ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
}

async function fetchGitHubRaw(owner: string, repo: string, path: string): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${path}`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'mdskills-importer' } })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

async function fetchRepoMetadata(owner: string, repo: string) {
  const url = `https://api.github.com/repos/${owner}/${repo}`
  try {
    const res = await fetch(url, { headers: githubHeaders })
    if (!res.ok) {
      console.error(`  ✗ GitHub API ${res.status}: ${res.statusText}`)
      return null
    }
    const data = await res.json()
    return {
      description: (data.description as string) || '',
      stars: data.stargazers_count as number,
      forks: data.forks_count as number,
      topics: (data.topics as string[]) || [],
      license: (data.license?.spdx_id as string) || null,
      updatedAt: data.updated_at as string,
      defaultBranch: (data.default_branch as string) || 'main',
    }
  } catch (err) {
    console.error(`  ✗ Failed to fetch repo metadata: ${err}`)
    return null
  }
}

// ── SKILL.md Discovery ───────────────────────────────────────────

/** Search common paths for SKILL.md */
async function discoverSkillMd(
  owner: string,
  repo: string,
  subpath?: string
): Promise<{ content: string; path: string } | null> {
  // If subpath is given, look there first
  const searchPaths: string[] = []

  if (subpath) {
    searchPaths.push(
      `${subpath}/SKILL.md`,
      `${subpath}/skill.md`,
    )
  }

  // Common locations
  searchPaths.push(
    'SKILL.md',
    'skill.md',
    '.claude/skills/SKILL.md',
    'skills/SKILL.md',
  )

  // Try to find skills in .claude/skills/*/SKILL.md pattern via the API
  // First check the common flat paths
  for (const path of searchPaths) {
    const content = await fetchGitHubRaw(owner, repo, path)
    if (content) {
      return { content, path }
    }
  }

  // Try listing .claude/skills/ directory for subdirectories
  const skillsDirs = ['.claude/skills', 'skills']
  for (const dir of skillsDirs) {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${dir}`
      const res = await fetch(url, { headers: githubHeaders })
      if (!res.ok) continue
      const items = await res.json()
      if (!Array.isArray(items)) continue

      for (const item of items) {
        if (item.type === 'dir') {
          const skillPath = `${dir}/${item.name}/SKILL.md`
          const content = await fetchGitHubRaw(owner, repo, skillPath)
          if (content) {
            return { content, path: skillPath }
          }
        }
      }
    } catch {
      continue
    }
  }

  return null
}

/** List ALL skills found in a repo (for mono-repos) */
async function listAllSkills(owner: string, repo: string): Promise<string[]> {
  const found: string[] = []
  const skillsDirs = ['.claude/skills', 'skills']

  for (const dir of skillsDirs) {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${dir}`
      const res = await fetch(url, { headers: githubHeaders })
      if (!res.ok) continue
      const items = await res.json()
      if (!Array.isArray(items)) continue

      for (const item of items) {
        if (item.type === 'dir') {
          const skillPath = `${dir}/${item.name}/SKILL.md`
          const content = await fetchGitHubRaw(owner, repo, skillPath)
          if (content) found.push(skillPath)
        }
      }
    } catch {
      continue
    }
  }

  // Also check root
  const rootSkill = await fetchGitHubRaw(owner, repo, 'SKILL.md')
  if (rootSkill) found.unshift('SKILL.md')

  return found
}

/** Fetch README.md (try subpath, then root) */
async function fetchReadme(owner: string, repo: string, skillDir?: string): Promise<string | null> {
  if (skillDir) {
    // Try README in the skill directory
    const dirReadme = await fetchGitHubRaw(owner, repo, `${skillDir}/README.md`)
    if (dirReadme) return dirReadme
  }
  // Fall back to repo root
  return await fetchGitHubRaw(owner, repo, 'README.md')
}

// ── Parsing ──────────────────────────────────────────────────────

interface Frontmatter {
  name: string
  description: string
  license?: string
  compatibility?: string[]
  tags?: string[]
  body: string
  raw: Record<string, string>
}

function parseFrontmatter(content: string): Frontmatter {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { name: '', description: '', body: content, raw: {} }

  const fmBlock = match[1]
  const body = match[2]

  // Parse simple key: value pairs
  const raw: Record<string, string> = {}
  for (const line of fmBlock.split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.+)$/)
    if (kv) {
      raw[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '')
    }
  }

  // Parse compatibility list
  const compatLines = fmBlock.match(/compatibility:\s*\n((?:\s+-\s+.+\n?)*)/m)
  const compatibility = compatLines
    ? compatLines[1].match(/- (.+)/g)?.map((m) => m.replace(/^- /, '').trim()) || []
    : raw.compatibility
      ? raw.compatibility.split(',').map((s) => s.trim())
      : []

  // Parse tags
  const tagLines = fmBlock.match(/tags:\s*\n((?:\s+-\s+.+\n?)*)/m)
  const tags = tagLines
    ? tagLines[1].match(/- (.+)/g)?.map((m) => m.replace(/^- /, '').trim()) || []
    : raw.tags
      ? raw.tags.split(',').map((s) => s.trim())
      : []

  return {
    name: raw.name || '',
    description: raw.description || '',
    license: raw.license,
    compatibility,
    tags,
    body,
    raw,
  }
}

/** Extract description from README when SKILL.md doesn't have one */
function descriptionFromReadme(readme: string | null, maxLen = 400): string {
  if (!readme) return ''
  // Remove title line
  const withoutTitle = readme.replace(/^#\s+.+?\n+/m, '').trim()
  // Take first block before any ## heading or triple newline
  const firstBlock = withoutTitle.split(/\n##\s|\n\n\n/)[0]
  if (!firstBlock) return ''
  // Strip markdown/HTML
  return firstBlock
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_`#]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, maxLen)
}

/** Common acronyms that should be all-caps */
const ACRONYMS = new Set([
  'ai', 'api', 'aws', 'ci', 'cd', 'cli', 'cms', 'cpu', 'css', 'csv',
  'db', 'dns', 'docx', 'dom', 'gcp', 'gif', 'gpu', 'html', 'http',
  'https', 'ide', 'io', 'ip', 'json', 'jwt', 'llm', 'mcp', 'ml',
  'npm', 'os', 'pdf', 'pptx', 'qa', 'rag', 'rest', 'rpc', 'sdk',
  'seo', 'sql', 'ssh', 'ssl', 'svg', 'tls', 'ui', 'url', 'ux',
  'vm', 'xml', 'xlsx', 'yaml',
])

/** Title-case a slug, respecting acronyms */
function titleCase(slug: string): string {
  return slug
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => {
      if (ACRONYMS.has(w.toLowerCase())) return w.toUpperCase()
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    })
    .join(' ')
}

/** Infer display name from repo name, frontmatter, or README heading */
function inferDisplayName(
  repoName: string,
  fmName: string,
  readme: string | null,
  skillDir?: string
): string {
  // Use frontmatter name if it looks like a proper name (has spaces, capitalization)
  if (fmName && fmName.includes(' ')) return fmName

  // If we have a frontmatter name, title-case it (e.g., "pdf" → "Pdf")
  // But prefer a skill-directory-derived name for better results
  const dirName = skillDir?.split('/').pop()

  // Try README heading, but only if it's not a generic repo name
  const readmeHeading = readme?.match(/^#\s+(.+)/m)?.[1]?.trim()
  if (readmeHeading && readmeHeading.length < 80) {
    // Strip emoji and markdown formatting
    const clean = readmeHeading
      .replace(/[*_`]/g, '')
      .replace(/^\W+/, '')
      .trim()
    // Skip if it matches the repo name (mono-repo root README)
    if (clean && clean.toLowerCase() !== repoName.toLowerCase()) {
      return clean
    }
  }

  // Title-case the best available source
  const bestName = fmName || dirName || repoName
  return titleCase(bestName)
}

/** Auto-detect platforms from content, frontmatter, and repo structure */
function detectPlatforms(
  fm: Frontmatter,
  skillContent: string,
  readme: string | null
): string[] {
  // Start with frontmatter compatibility list
  if (fm.compatibility && fm.compatibility.length > 0) {
    // Normalize to our slug format
    const mapped = fm.compatibility.map((c) =>
      c.toLowerCase().replace(/\s+/g, '-')
    )
    return Array.from(new Set(mapped))
  }

  // Auto-detect from content mentions
  const allContent = `${skillContent}\n${readme || ''}`
  const platforms = new Set<string>()

  if (/claude.code|claude-code|\.claude/i.test(allContent)) platforms.add('claude-code')
  if (/cursor/i.test(allContent)) platforms.add('cursor')
  if (/codex/i.test(allContent)) platforms.add('codex')
  if (/windsurf/i.test(allContent)) platforms.add('windsurf')
  if (/copilot/i.test(allContent)) platforms.add('github-copilot')
  if (/gemini/i.test(allContent)) platforms.add('gemini-cli')

  // Default to claude-code if nothing detected (SKILL.md format is from Claude)
  if (platforms.size === 0) platforms.add('claude-code')

  return Array.from(platforms)
}

/** Auto-detect permissions from SKILL.md content */
function detectPermissions(content: string): {
  perm_filesystem_read: boolean
  perm_filesystem_write: boolean
  perm_shell_exec: boolean
  perm_network_access: boolean
  perm_git_write: boolean
} {
  const lower = content.toLowerCase()
  return {
    perm_filesystem_read: /read|file|fs|path|directory|folder/i.test(lower),
    perm_filesystem_write: /write|create|save|output|generate.*file/i.test(lower),
    perm_shell_exec: /exec|command|shell|bash|terminal|npm|npx|pip/i.test(lower),
    perm_network_access: /fetch|http|api|url|request|download|curl/i.test(lower),
    perm_git_write: /git push|git commit|git add/i.test(lower),
  }
}

/** Detect artifact type from repo name and frontmatter (not body content) */
function detectArtifactType(
  fmRaw: Record<string, string>,
  repoName: string
): string {
  // Check frontmatter type field first
  const fmType = fmRaw.type?.toLowerCase() || fmRaw.artifact_type?.toLowerCase() || ''
  if (fmType.includes('mcp')) return 'mcp_server'
  if (fmType.includes('rule')) return 'ruleset'
  if (fmType.includes('workflow')) return 'workflow_pack'
  if (fmType.includes('template') || fmType.includes('starter')) return 'template_bundle'

  // Check repo name for strong signals
  const lower = repoName.toLowerCase()
  if (/^mcp[-_]|[-_]mcp$|mcp[-_]server/.test(lower)) return 'mcp_server'
  if (/cursorrules|\.cursorrules/.test(lower)) return 'ruleset'
  if (/template|starter|scaffold/.test(lower)) return 'template_bundle'

  return 'skill_pack'
}

/** Detect skill type (skill, plugin, hybrid) */
function detectSkillType(
  owner: string,
  repo: string,
  skillPath: string
): { skillType: string; hasPlugin: boolean } {
  // If there's a .claude-plugin dir or the skill path suggests plugin structure
  if (skillPath.includes('.claude/') || skillPath.includes('plugin')) {
    return { skillType: 'hybrid', hasPlugin: true }
  }
  return { skillType: 'skill', hasPlugin: false }
}

/** Generate a clean slug from the skill path and repo name */
function generateSlug(owner: string, repo: string, skillPath: string): string {
  // For README-only imports, use the repo name
  if (skillPath === 'README.md' || skillPath === 'AGENTS.md') {
    return repo
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // For skills nested in a directory, use the parent directory name
  // e.g., skills/pdf/SKILL.md → "pdf"
  // e.g., .claude/skills/interface-design/SKILL.md → "interface-design"
  const parts = skillPath.replace('/SKILL.md', '').replace('/skill.md', '').split('/')
  const dirName = parts[parts.length - 1] || repo

  // If the directory name is generic (like "skills" or ".claude"), use repo name
  const genericNames = ['skills', '.claude', 'src', 'lib', 'root']
  const base = genericNames.includes(dirName.toLowerCase()) ? repo : dirName

  return base
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Category lookup ──────────────────────────────────────────────

async function getCategoryId(slug: string): Promise<string | null> {
  const { data } = await supabase.from('categories').select('id').eq('slug', slug).single()
  return data?.id ?? null
}

async function listCategories(): Promise<{ slug: string; name: string }[]> {
  const { data } = await supabase
    .from('categories')
    .select('slug, name')
    .order('sort_order', { ascending: true })
  return data ?? []
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const { owner, repo, subpath } = parseGithubUrl(args.url)

  console.log(`\n🔍 Importing from: ${owner}/${repo}${subpath ? `/${subpath}` : ''}`)
  console.log('─'.repeat(60))

  // 1. Fetch repo metadata
  console.log('\n📦 Fetching repo metadata...')
  const meta = await fetchRepoMetadata(owner, repo)
  if (!meta) {
    console.error('✗ Could not fetch repo metadata. Is the repo public?')
    process.exit(1)
  }
  console.log(`  ✓ ${meta.stars} stars, ${meta.forks} forks, license: ${meta.license || 'none'}`)
  console.log(`  ✓ Topics: ${meta.topics.length > 0 ? meta.topics.join(', ') : '(none)'}`)

  // Handle --list flag: show all SKILL.md files and exit
  if (args.list) {
    console.log('\n📋 Scanning for all SKILL.md files...')
    const allSkills = await listAllSkills(owner, repo)
    if (allSkills.length === 0) {
      console.log('  No SKILL.md files found.')
    } else {
      console.log(`  Found ${allSkills.length} skill(s):\n`)
      for (const path of allSkills) {
        const skillName = path.split('/').slice(-2, -1)[0] || repo
        console.log(`  ${path}`)
        console.log(`    → import with: npx tsx scripts/import-from-github.ts https://github.com/${owner}/${repo}/tree/main/${path.replace('/SKILL.md', '')}`)
        console.log('')
      }
    }
    return
  }

  // 2. Discover SKILL.md
  console.log('\n📄 Searching for SKILL.md...')
  const skill = await discoverSkillMd(owner, repo, subpath)
  let skillDir: string | undefined
  let fm: Frontmatter
  let readme: string | null
  let usingReadmeFallback = false

  if (skill) {
    console.log(`  ✓ Found: ${skill.path} (${skill.content.length} bytes)`)

    // Extract the directory containing SKILL.md
    skillDir = skill.path.includes('/')
      ? skill.path.split('/').slice(0, -1).join('/')
      : undefined

    // 3. Parse frontmatter
    fm = parseFrontmatter(skill.content)
    console.log(`  ✓ Frontmatter: name="${fm.name}", desc="${fm.description.slice(0, 60)}..."`)

    // 4. Fetch README
    console.log('\n📖 Fetching README...')
    readme = await fetchReadme(owner, repo, skillDir)
    console.log(readme ? `  ✓ README: ${readme.length} bytes` : '  ⚠ No README found')
  } else {
    // No SKILL.md found — fall back to README-based import
    console.log('  ⚠ No SKILL.md found — falling back to README-based import')

    // Also check for AGENTS.md
    const agentsMd = await fetchGitHubRaw(owner, repo, 'AGENTS.md')
    if (agentsMd) {
      console.log('  ✓ Found AGENTS.md — using as skill content')
    }

    console.log('\n📖 Fetching README...')
    readme = await fetchReadme(owner, repo, subpath)
    if (!readme) {
      console.error('✗ No SKILL.md or README.md found. Cannot import.')
      process.exit(1)
    }
    console.log(`  ✓ README: ${readme.length} bytes`)

    // Parse frontmatter from README (some READMEs have it) or build minimal
    fm = parseFrontmatter(agentsMd || readme)
    usingReadmeFallback = true
  }

  // 5. Build the skill record
  const skillPath = skill?.path || 'README.md'
  const skillContent = skill?.content || readme || ''
  const slug = args.slug || generateSlug(owner, repo, skillPath)
  const displayName = args.name || inferDisplayName(repo, fm.name, readme, skillDir)
  const description =
    fm.description ||
    descriptionFromReadme(readme) ||
    meta.description ||
    `${displayName} - AI agent skill`
  const platforms = args.platforms || detectPlatforms(fm, skillContent, readme)
  const permissions = detectPermissions(skillContent)
  const artifactType = args.artifactType || detectArtifactType(fm.raw, repo)
  const { skillType, hasPlugin } = detectSkillType(owner, repo, skillPath)
  const tags = Array.from(new Set([
    ...(fm.tags || []),
    ...meta.topics.slice(0, 10),
  ])).slice(0, 15)

  // Category
  let categoryId: string | null = null
  if (args.category) {
    categoryId = await getCategoryId(args.category)
    if (!categoryId) {
      console.error(`\n✗ Category "${args.category}" not found.`)
      const cats = await listCategories()
      console.error('  Available categories:')
      for (const c of cats) {
        console.error(`    ${c.slug.padEnd(24)} ${c.name}`)
      }
      process.exit(1)
    }
  }

  const githubUrl = subpath
    ? `https://github.com/${owner}/${repo}/tree/${meta.defaultBranch}/${subpath}`
    : `https://github.com/${owner}/${repo}`

  const record = {
    slug,
    name: displayName,
    description: description.slice(0, 500),
    owner,
    repo,
    skill_path: skillDir || skillPath.replace('/SKILL.md', '').replace('/README.md', ''),
    github_url: githubUrl,
    content: skillContent,
    readme,
    status: 'published' as const,
    featured: false,
    skill_type: skillType,
    has_plugin: hasPlugin,
    has_examples: false,
    difficulty: 'intermediate' as const,
    category_id: categoryId,
    author_username: owner,
    github_stars: meta.stars,
    github_forks: meta.forks,
    license: meta.license || fm.license,
    weekly_installs: 0,
    mdskills_upvotes: 0,
    mdskills_forks: 0,
    platforms,
    tags,
    artifact_type: artifactType,
    format_standard: usingReadmeFallback ? 'generic' : 'skill_md',
    ...permissions,
  }

  // 6. Display summary
  console.log('\n' + '─'.repeat(60))
  console.log('📋 Import Summary:')
  console.log('─'.repeat(60))
  console.log(`  Slug:          ${record.slug}`)
  console.log(`  Name:          ${record.name}`)
  console.log(`  Description:   ${record.description.slice(0, 80)}...`)
  console.log(`  Owner:         ${record.owner}`)
  console.log(`  Repo:          ${record.repo}`)
  console.log(`  Skill Path:    ${record.skill_path}`)
  console.log(`  GitHub URL:    ${record.github_url}`)
  console.log(`  Platforms:     ${record.platforms.join(', ')}`)
  console.log(`  Tags:          ${record.tags.join(', ')}`)
  console.log(`  License:       ${record.license || 'none'}`)
  console.log(`  Type:          ${record.artifact_type}`)
  console.log(`  Skill Type:    ${record.skill_type} (plugin: ${record.has_plugin})`)
  console.log(`  Stars:         ${record.github_stars}`)
  console.log(`  Category:      ${args.category || '(none - assign later)'}`)
  console.log(`  Permissions:   ${Object.entries(permissions).filter(([, v]) => v).map(([k]) => k.replace('perm_', '')).join(', ') || 'none'}`)
  console.log('─'.repeat(60))

  if (args.dryRun) {
    console.log('\n🏁 Dry run — nothing was written to the database.')
    console.log('  Remove --dry-run to actually import.')
    return
  }

  // 7. Upsert to database
  console.log('\n💾 Writing to database...')
  const { data, error } = await supabase
    .from('skills')
    .upsert(record, { onConflict: 'slug' })
    .select('id, slug, name')
    .single()

  if (error) {
    console.error(`✗ Database error: ${error.message}`)
    process.exit(1)
  }
  console.log(`  ✓ Saved: ${data.name} (id: ${data.id})`)

  // 8. Link to clients
  if (data.id) {
    console.log('\n🔗 Linking to clients...')
    const clientSlugs = [...record.platforms]
    // Always include claude-code
    if (!clientSlugs.includes('claude-code')) clientSlugs.unshift('claude-code')

    for (const clientSlug of clientSlugs) {
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('slug', clientSlug)
        .single()

      if (client) {
        // Generate appropriate install instructions based on artifact type and client
        let instructions: string
        if (artifactType === 'mcp_server') {
          // MCP servers use platform-specific install commands
          const npmPackage = repo // Usually the npm package matches the repo name
          if (clientSlug === 'claude-code') {
            instructions = `claude mcp add ${slug} -- npx -y ${npmPackage}`
          } else if (clientSlug === 'cursor') {
            instructions = `Add to .cursor/mcp.json:\n{"mcpServers":{"${slug}":{"command":"npx","args":["-y","${npmPackage}"]}}}`
          } else {
            instructions = `npx -y ${npmPackage}`
          }
        } else {
          instructions = `npx mdskills install ${owner}/${slug}`
        }

        await supabase.from('listing_clients').upsert(
          {
            skill_id: data.id,
            client_id: client.id,
            install_instructions: instructions,
            is_primary: clientSlug === 'claude-code',
          },
          { onConflict: 'skill_id,client_id' }
        )
        console.log(`  ✓ ${clientSlug}`)
      } else {
        console.log(`  ⚠ Client not found: ${clientSlug}`)
      }
    }
  }

  console.log(`\n✅ Done! View at: /skills/${record.slug}`)
  console.log(`   Edit: https://app.supabase.com → skills table → slug: ${record.slug}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
