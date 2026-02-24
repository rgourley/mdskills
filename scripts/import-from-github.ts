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
import { extractTagsFromContent } from '../src/lib/extract-tags'

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
  all: boolean
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
    console.error('  --all                   Import ALL discovered SKILL.md files from the repo')
    console.error('')
    console.error('Examples:')
    console.error('  npx tsx scripts/import-from-github.ts https://github.com/owner/repo')
    console.error('  npx tsx scripts/import-from-github.ts https://github.com/owner/repo/tree/main/skills/pdf')
    console.error('  npx tsx scripts/import-from-github.ts owner/repo --category code-generation --dry-run')
    console.error('  npx tsx scripts/import-from-github.ts owner/mono-repo --list')
    console.error('  npx tsx scripts/import-from-github.ts owner/skill-collection --all')
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
    all: args.includes('--all'),
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

/** List ALL SKILL.md files in a repo using Git Trees API (efficient for large repos).
 *  Single API call handles up to 100k files. Falls back to Contents API if Trees fails. */
async function listAllSkills(owner: string, repo: string): Promise<string[]> {
  // Try Git Trees API first — 1 API call instead of N+1
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`
    const res = await fetch(url, { headers: githubHeaders })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.tree)) {
        const skillFiles = data.tree
          .filter((item: { path: string; type: string }) =>
            item.type === 'blob' && /\/(SKILL|skill)\.md$/.test(item.path)
          )
          .map((item: { path: string }) => item.path)
          .sort()

        // Also discover plugin directories (contain .claude-plugin/ config)
        const pluginDirs = data.tree
          .filter((item: { path: string; type: string }) =>
            item.type === 'tree' && /\/\.claude-plugin$/.test(item.path)
          )
          .map((item: { path: string }) => {
            // e.g., "plugins/workflow/.claude-plugin" → "plugins/workflow/README.md"
            const parentDir = item.path.replace(/\/\.claude-plugin$/, '')
            return `${parentDir}/README.md`
          })

        // Add plugins — always import the plugin README as a separate listing
        // (nested SKILL.md files within the plugin are separate skills, not replacements)
        const genericContainers = ['plugins', '.claude/plugins', '.claude']
        for (const pluginReadme of pluginDirs) {
          const pluginDir = pluginReadme.replace('/README.md', '')
          // Skip generic container directories (e.g., "plugins/.claude-plugin" → "plugins" is a container)
          if (genericContainers.includes(pluginDir)) continue
          // Only skip if there's a SKILL.md directly in the plugin dir (same level)
          const hasDirectSkillMd = skillFiles.some((f: string) =>
            f === `${pluginDir}/SKILL.md` || f === `${pluginDir}/skill.md`
          )
          if (!hasDirectSkillMd) {
            skillFiles.push(pluginReadme)
          }
        }

        if (skillFiles.length > 0) {
          // Also check for root SKILL.md
          const rootSkill = data.tree.find(
            (item: { path: string; type: string }) =>
              item.type === 'blob' && /^(SKILL|skill)\.md$/.test(item.path)
          )
          if (rootSkill && !skillFiles.includes(rootSkill.path)) {
            skillFiles.unshift(rootSkill.path)
          }
          return skillFiles
        }
      }
    }
  } catch { /* fall through to legacy approach */ }

  // Fallback: Contents API (original approach, limited to ~1000 entries per directory)
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

  // Also check plugins/ directory for .claude-plugin directories
  const pluginDirs = ['plugins', '.claude/plugins']
  for (const dir of pluginDirs) {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${dir}`
      const res = await fetch(url, { headers: githubHeaders })
      if (!res.ok) continue
      const items = await res.json()
      if (!Array.isArray(items)) continue

      for (const item of items) {
        if (item.type === 'dir') {
          // Check if this directory has a .claude-plugin config
          const pluginConfig = await fetchGitHubRaw(owner, repo, `${dir}/${item.name}/.claude-plugin/manifest.json`)
            || await fetchGitHubRaw(owner, repo, `${dir}/${item.name}/.claude-plugin/plugin.json`)
          if (pluginConfig) {
            const readmePath = `${dir}/${item.name}/README.md`
            const readme = await fetchGitHubRaw(owner, repo, readmePath)
            if (readme) found.push(readmePath)
          }
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

/** Truncate text at the last sentence boundary within maxLen, or last word boundary with ellipsis */
function truncateDescription(text: string, maxLen = 500): string {
  if (text.length <= maxLen) return text
  const trimmed = text.slice(0, maxLen)
  const lastSentence = trimmed.search(/[.!?][^.!?]*$/)
  if (lastSentence > maxLen * 0.5) return trimmed.slice(0, lastSentence + 1).trim()
  const lastSpace = trimmed.lastIndexOf(' ')
  if (lastSpace > maxLen * 0.5) return trimmed.slice(0, lastSpace).trim() + '...'
  return trimmed + '...'
}

/** Extract description from README when SKILL.md doesn't have one */
function descriptionFromReadme(readme: string | null, maxLen = 400): string {
  if (!readme) return ''
  let text = readme
    // Strip fenced code blocks (``` ... ```) including mermaid, ascii art, etc.
    .replace(/```[\s\S]*?```/g, '')
    // Strip HTML tags (including <p>, <h1>, <img>, <a>, badges, etc.)
    .replace(/<[^>]+>/g, ' ')
    // Strip all markdown headings
    .replace(/^#{1,6}\s+.+$/gm, '')
    // Strip blockquotes (often contain notices, not descriptions)
    .replace(/^>\s*.*$/gm, '')
    // Strip markdown tables (lines starting with |)
    .replace(/^\|.*$/gm, '')
    // Strip badge/image markdown ![alt](url)
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    // Strip empty-text links [](url)
    .replace(/\[\s*\]\([^)]+\)/g, '')
    // Strip badge-style links [![...](img)](url)
    .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, '')
    // Convert remaining link markdown [text](url) to just text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Strip horizontal rules
    .replace(/^-{3,}$/gm, '')
    // Strip lines that are only URLs
    .replace(/^https?:\/\/\S+$/gm, '')
    // Strip remaining markdown formatting
    .replace(/[*_`#]/g, '')
    .trim()

  // Split into lines, skip empty/whitespace-only lines, find first real paragraph
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 10)
  if (lines.length === 0) return ''

  // Take lines until we hit a section break or have enough text
  const paragraphs: string[] = []
  for (const line of lines) {
    if (paragraphs.length > 0 && line === '') break
    paragraphs.push(line)
    const joined = paragraphs.join(' ')
    if (joined.length > maxLen) break
  }

  return paragraphs
    .join(' ')
    .replace(/\s{2,}/g, ' ')
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

/** Special brand/compound words that need specific casing */
const SPECIAL_WORDS: Record<string, string> = {
  openai: 'OpenAI',
  github: 'GitHub',
  gitlab: 'GitLab',
  bitbucket: 'BitBucket',
  youtube: 'YouTube',
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  mongodb: 'MongoDB',
  nextjs: 'Next.js',
  nodejs: 'Node.js',
  vuejs: 'Vue.js',
  nuxtjs: 'Nuxt.js',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  graphql: 'GraphQL',
  devops: 'DevOps',
  chatgpt: 'ChatGPT',
  ollama: 'Ollama',
  supabase: 'Supabase',
  firebase: 'Firebase',
  kubernetes: 'Kubernetes',
  terraform: 'Terraform',
  dockerfile: 'Dockerfile',
  elasticsearch: 'Elasticsearch',
  langchain: 'LangChain',
  openrouter: 'OpenRouter',
  deepseek: 'DeepSeek',
  midjourney: 'Midjourney',
  cloudflare: 'Cloudflare',
  pinecone: 'Pinecone',
  weaviate: 'Weaviate',
}

/** Title-case a slug, respecting acronyms and special words */
function titleCase(slug: string): string {
  return slug
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => {
      const lower = w.toLowerCase()
      if (ACRONYMS.has(lower)) return w.toUpperCase()
      if (SPECIAL_WORDS[lower]) return SPECIAL_WORDS[lower]
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    })
    .join(' ')
}

/** Reject headings that are clearly not project names */
function isValidHeading(heading: string): boolean {
  if (!heading || heading.length < 3 || heading.length > 60) return false
  if (/^(For|A|An|The|How|Getting|Introduction|Overview|About|README|Table of|Usage|Install|Sponsor|Platinum|Gold|Silver|Contributors|Contributing|License|Changelog|Features|Prerequisites|Requirements|Documentation|Support|Acknowledgements)\b/i.test(heading)) return false
  if (heading.includes('![') || heading.includes('](') || heading.includes('```')) return false
  return true
}

/** Infer display name from repo name, frontmatter, or README heading */
function inferDisplayName(
  repoName: string,
  fmName: string,
  readme: string | null,
  skillDir?: string
): string {
  // Use frontmatter name if it looks like a proper name (has spaces, capitalization)
  // BUT sanity-check it against the repo name — if zero word overlap, prefer repo name
  // e.g., frontmatter "MCP Source" for repo "unity-mcp" → should be "Unity MCP"
  if (fmName && fmName.includes(' ')) {
    const fmWords = new Set(fmName.toLowerCase().split(/[\s\-_]+/))
    const repoWords = repoName.toLowerCase().split(/[\s\-_]+/)
    const hasOverlap = repoWords.some(w => w.length > 3 && fmWords.has(w))
    if (hasOverlap || repoWords.length <= 1) return fmName
    // No overlap — fall through to try better sources
  }

  // If frontmatter has a slug-style name (e.g. "angular-architect"), titleCase it
  // This is a stronger signal than README headings, especially in multi-skill repos
  if (fmName && (fmName.includes('-') || fmName.includes('_'))) return titleCase(fmName)

  const dirName = skillDir?.split('/').pop()

  if (readme) {
    // Check HTML headings first: <h1>Title</h1> or <h1 align="center">Title</h1>
    const htmlHeading = readme.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim()
    // Only match h1 (single #), not h2/h3 — use negative lookahead to exclude ##
    const mdHeading = readme.match(/^#\s(?!#)(.+)/m)?.[1]?.trim()
    const readmeHeading = htmlHeading || mdHeading
    if (readmeHeading) {
      let clean = readmeHeading
        .replace(/[*_`]/g, '')
        .replace(/^\W+/, '')
        .trim()
      if (isValidHeading(clean)) {
        // If the heading looks slug-style (has hyphens but no spaces), titleCase it
        if (clean.includes('-') && !clean.includes(' ')) {
          clean = titleCase(clean)
        }
        return clean
      }
    }
  }

  // Title-case the best available source
  const bestName = fmName || dirName || repoName
  return titleCase(bestName)
}

// Clients that can consume generic markdown instructions (SKILL.md, AGENTS.md, etc.)
const MARKDOWN_CLIENTS = [
  'claude-code', 'claude-desktop', 'cursor', 'vscode-copilot', 'windsurf',
  'continue-dev', 'codex', 'gemini-cli', 'amp', 'roo-code', 'goose',
  'opencode', 'trae', 'qodo', 'command-code',
]

// Clients that support MCP protocol
const MCP_CLIENTS = [
  'claude-code', 'claude-desktop', 'cursor', 'vscode-copilot', 'windsurf',
  'continue-dev', 'gemini-cli', 'amp', 'roo-code', 'goose',
]

// Format-specific client mappings
const FORMAT_SPECIFIC_CLIENTS: Record<string, string[]> = {
  cursorrules: ['cursor'],
  mdc: ['cursor'],
  claude_md: ['claude-code', 'claude-desktop'],
  copilot_instructions: ['vscode-copilot', 'github'],
  gemini_md: ['gemini', 'gemini-cli'],
  windsurf_rules: ['windsurf'],
  clinerules: ['roo-code'],
}

/** Auto-detect platforms from content, frontmatter, artifact type, and format */
function detectPlatforms(
  fm: Frontmatter,
  skillContent: string,
  readme: string | null,
  artifactType?: string,
  formatStandard?: string,
): string[] {
  // If frontmatter explicitly declares compatibility, respect that
  if (fm.compatibility && fm.compatibility.length > 0) {
    const mapped = fm.compatibility.map((c) =>
      c.toLowerCase().replace(/\s+/g, '-')
    )
    return Array.from(new Set(mapped))
  }

  // Format-specific rules files only work with their target client
  if (formatStandard && FORMAT_SPECIFIC_CLIENTS[formatStandard]) {
    return FORMAT_SPECIFIC_CLIENTS[formatStandard]
  }

  // MCP servers work with all MCP-capable clients
  if (artifactType === 'mcp_server') {
    return [...MCP_CLIENTS]
  }

  // Generic markdown skills work with all markdown-consuming clients
  const platforms = new Set<string>(MARKDOWN_CLIENTS)

  const allContent = `${skillContent}\n${readme || ''}`

  // Add extra clients if explicitly mentioned
  if (/chatgpt/i.test(allContent)) platforms.add('chatgpt')
  if (/grok/i.test(allContent)) platforms.add('grok')
  if (/replit/i.test(allContent)) platforms.add('replit')
  if (/firebender/i.test(allContent)) platforms.add('firebender')
  if (/spring.ai/i.test(allContent)) platforms.add('spring-ai')
  if (/databricks/i.test(allContent)) platforms.add('databricks')
  if (/letta/i.test(allContent)) platforms.add('letta')
  if (/factory/i.test(allContent)) platforms.add('factory')

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
  if (fmType.includes('extension')) return 'extension'
  if (fmType.includes('tool')) return 'tool'

  // Check repo name for strong signals
  const lower = repoName.toLowerCase()
  if (/^mcp[-_]|[-_]mcp$|mcp[-_]server/.test(lower)) return 'mcp_server'
  if (/cursorrules|\.cursorrules/.test(lower)) return 'ruleset'
  if (/template|starter|scaffold/.test(lower)) return 'template_bundle'
  if (/vscode|vs-code|[-_]extension$/.test(lower)) return 'extension'

  return 'skill_pack'
}

/** Detect skill type (skill, plugin, hybrid) */
function detectSkillType(
  owner: string,
  repo: string,
  skillPath: string,
  topics?: string[],
  readme?: string | null,
): { skillType: string; hasPlugin: boolean } {
  // Check skill path for plugin indicators
  if (skillPath.includes('.claude/') || skillPath.includes('plugin')) {
    return { skillType: 'hybrid', hasPlugin: true }
  }
  // Check repo topics for plugin signals
  const topicStr = (topics || []).join(' ').toLowerCase()
  if (/\bplugins?\b/.test(topicStr) && /\bclaude\b/.test(topicStr)) {
    return { skillType: 'hybrid', hasPlugin: true }
  }
  // Check README for plugin mentions
  if (readme) {
    const head = readme.slice(0, 2000).toLowerCase()
    if (/claude\s*code\s*plugin/i.test(head) || /\.claude\/.*plugin/i.test(head)) {
      return { skillType: 'hybrid', hasPlugin: true }
    }
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

  // For skills/plugins nested in a directory, use the parent directory name
  // e.g., skills/pdf/SKILL.md → "pdf"
  // e.g., .claude/skills/interface-design/SKILL.md → "interface-design"
  // e.g., plugins/workflow/README.md → "workflow"
  const parts = skillPath.replace('/SKILL.md', '').replace('/skill.md', '').replace('/README.md', '').split('/')
  const dirName = parts[parts.length - 1] || repo

  // If the directory name is generic (like "skills" or ".claude"), use repo name
  const genericNames = ['skills', '.claude', 'src', 'lib', 'root', 'plugins']
  const base = genericNames.includes(dirName.toLowerCase()) ? repo : dirName

  return base
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Category auto-detection ──────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'claude-code-plugins': ['claude code plugin', 'claude plugin', 'claude-code plugin', 'slash-commands', 'claude code skills', 'claude code hooks'],
  'code-review': ['code review', 'lint', 'linting', 'eslint', 'prettier', 'code quality', 'static analysis', 'code style'],
  'documentation': ['documentation', 'docs', 'readme', 'jsdoc', 'typedoc', 'api docs', 'docstring'],
  'testing': ['testing', 'test', 'jest', 'mocha', 'pytest', 'unit test', 'e2e', 'qa', 'quality assurance', 'playwright', 'cypress', 'vitest'],
  'security': ['security', 'vulnerability', 'cve', 'owasp', 'pentest', 'penetration test', 'encryption', 'exploit', 'malware', 'firewall'],
  'api-development': ['api', 'rest', 'graphql', 'openapi', 'swagger', 'endpoint', 'webhook', 'grpc'],
  'data-analysis': ['data analysis', 'data science', 'analytics', 'visualization', 'pandas', 'jupyter', 'notebook', 'csv', 'dataset'],
  'productivity': ['productivity', 'automation', 'workflow', 'task', 'todo', 'scheduling', 'time tracking', 'cli tool'],
  'creative': ['creative', 'writing', 'content', 'copywriting', 'blog', 'storytelling', 'image', 'art'],
  'design-systems': ['design system', 'ui', 'component', 'tailwind', 'css', 'react component', 'figma', 'storybook', 'frontend'],
  'information-architecture': ['information architecture', 'navigation', 'sitemap', 'taxonomy', 'content structure'],
  'resume-writing': ['resume', 'cv', 'cover letter', 'career', 'job', 'hiring', 'interview'],
  'devops-ci-cd': ['devops', 'ci/cd', 'docker', 'kubernetes', 'terraform', 'github actions', 'deployment', 'infrastructure', 'pipeline', 'aws', 'gcp', 'azure'],
  'database-design': ['database', 'sql', 'postgres', 'mysql', 'mongodb', 'schema', 'migration', 'orm', 'prisma', 'supabase'],
  'content-creation': ['content creation', 'blog post', 'marketing', 'seo', 'social media', 'newsletter', 'copywriting'],
  'research-analysis': ['research', 'analysis', 'literature review', 'synthesis', 'survey', 'paper', 'academic'],
  'code-generation': ['code generation', 'scaffolding', 'boilerplate', 'generator', 'template', 'starter', 'cli'],
}

function detectCategory(topics: string[], description: string, repoName: string, readme: string | null): string | null {
  const text = [
    ...topics,
    description,
    repoName.replace(/[-_]/g, ' '),
    (readme || '').slice(0, 500),
  ].join(' ').toLowerCase()

  let bestCategory: string | null = null
  let bestScore = 0

  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0
    for (const kw of keywords) {
      if (text.includes(kw)) {
        score += topics.some(t => t.toLowerCase().includes(kw)) ? 3 : 1
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestCategory = slug
    }
  }

  return bestScore >= 2 ? bestCategory : null
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

  // Handle --list flag: show all SKILL.md files and plugins and exit
  if (args.list) {
    console.log('\n📋 Scanning for skills and plugins...')
    const allSkills = await listAllSkills(owner, repo)
    if (allSkills.length === 0) {
      console.log('  No SKILL.md or plugin files found.')
    } else {
      const pluginCount = allSkills.filter(p => p.endsWith('/README.md')).length
      const skillCount = allSkills.length - pluginCount
      console.log(`  Found ${skillCount} skill(s) + ${pluginCount} plugin(s):\n`)
      for (const path of allSkills) {
        const isPlugin = path.endsWith('/README.md')
        const dirPath = path.replace(/\/(SKILL|skill|README)\.md$/i, '')
        console.log(`  ${isPlugin ? '🔌' : '📄'} ${path}`)
        console.log(`    → import with: npx tsx scripts/import-from-github.ts https://github.com/${owner}/${repo}/tree/main/${dirPath}`)
        console.log('')
      }
    }
    return
  }

  // Handle --all flag: batch import every discovered SKILL.md
  if (args.all) {
    console.log('\n📦 Batch importing all skills...')
    const allSkillPaths = await listAllSkills(owner, repo)

    if (allSkillPaths.length === 0) {
      console.log('  No SKILL.md or plugin files found.')
      return
    }

    const pluginCount = allSkillPaths.filter(p => p.endsWith('/README.md')).length
    const skillCount = allSkillPaths.length - pluginCount
    console.log(`  Found ${skillCount} skill(s) + ${pluginCount} plugin(s) to import\n`)

    if (args.dryRun) {
      console.log('  DRY RUN — listing what would be imported:\n')
      for (const path of allSkillPaths) {
        const slug = generateSlug(owner, repo, path)
        console.log(`  ${slug.padEnd(40)} ← ${path}`)
      }
      console.log(`\n🏁 Would import ${allSkillPaths.length} skill(s). Remove --dry-run to proceed.`)
      return
    }

    let succeeded = 0
    let failed = 0
    const errors: Array<{ path: string; error: string }> = []

    for (let i = 0; i < allSkillPaths.length; i++) {
      const skillPath = allSkillPaths[i]
      const isPluginReadme = skillPath.endsWith('/README.md')
      const dirPath = skillPath.replace(/\/(SKILL|skill|README)\.md$/i, '')
      const slug = generateSlug(owner, repo, skillPath)

      process.stdout.write(`  [${String(i + 1).padStart(String(allSkillPaths.length).length)}/${allSkillPaths.length}] ${slug}... `)

      try {
        // Fetch content (SKILL.md or README.md for plugins)
        const skillContent = await fetchGitHubRaw(owner, repo, skillPath)
        if (!skillContent) {
          console.log(`⚠ not found, skipping`)
          failed++
          errors.push({ path: skillPath, error: `${isPluginReadme ? 'README.md' : 'SKILL.md'} not found` })
          continue
        }

        const fm = parseFrontmatter(skillContent)
        const skillDir = skillPath.includes('/') ? skillPath.split('/').slice(0, -1).join('/') : undefined

        // For SKILL.md imports, try to find a README in the same directory
        // For plugin README imports, the README IS the content
        let readme: string | null = null
        if (isPluginReadme) {
          readme = skillContent  // README is the primary content for plugins
        } else {
          if (skillDir) {
            readme = await fetchGitHubRaw(owner, repo, `${skillDir}/README.md`)
          }
          if (!readme) {
            readme = skillContent  // Use SKILL.md as the display content
          }
        }

        const displayName = inferDisplayName(repo, fm.name, readme, skillDir)
        const description = (
          fm.description ||
          descriptionFromReadme(readme) ||
          meta.description ||
          `${displayName} - AI agent skill`
        ).slice(0, 500)
        const permissions = detectPermissions(skillContent)
        const artifactType = isPluginReadme ? 'plugin' : (args.artifactType || detectArtifactType(fm.raw, repo))
        const formatStd = isPluginReadme ? 'generic' : 'skill_md'
        const platforms = args.platforms || detectPlatforms(fm, skillContent, readme, artifactType, formatStd)
        const { skillType, hasPlugin } = isPluginReadme
          ? { skillType: 'hybrid' as string, hasPlugin: true }
          : detectSkillType(owner, repo, skillPath, meta.topics, readme)
        // For batch imports, only use per-skill frontmatter tags (not repo-level topics)
        const tags = Array.from(new Set(fm.tags || [])).slice(0, 15)

        // Category detection — plugins go to claude-code-plugins by default
        let categorySlug = args.category || null
        if (!categorySlug) {
          if (isPluginReadme || hasPlugin) {
            categorySlug = 'claude-code-plugins'
          } else {
            categorySlug = detectCategory(meta.topics, description, repo, readme)
          }
        }
        let categoryId: string | null = null
        if (categorySlug) {
          categoryId = await getCategoryId(categorySlug)
        }

        const githubUrl = `https://github.com/${owner}/${repo}/tree/${meta.defaultBranch}/${dirPath}`

        const record = {
          slug,
          name: displayName,
          description,
          owner,
          repo,
          skill_path: skillDir || dirPath,
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
          format_standard: formatStd,
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
          errors.push({ path: skillPath, error: error.message })
          continue
        }

        // Link to clients
        if (data.id) {
          const clientSlugs = [...record.platforms]
          if (!clientSlugs.includes('claude-code')) clientSlugs.unshift('claude-code')
          for (const clientSlug of clientSlugs) {
            const { data: client } = await supabase.from('clients').select('id').eq('slug', clientSlug).single()
            if (client) {
              const instructions = artifactType === 'mcp_server'
                ? (clientSlug === 'claude-code' ? `claude mcp add ${slug} -- npx -y ${repo}` : `npx -y ${repo}`)
                : `npx mdskills install ${owner}/${slug}`
              await supabase.from('listing_clients').upsert(
                { skill_id: data.id, client_id: client.id, install_instructions: instructions, is_primary: clientSlug === 'claude-code' },
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
        errors.push({ path: skillPath, error: msg })
      }

      // Small delay between imports
      if (i < allSkillPaths.length - 1) {
        await new Promise(r => setTimeout(r, 200))
      }
    }

    // Summary
    console.log('\n' + '─'.repeat(60))
    console.log(`✅ Batch import complete!`)
    console.log(`  Succeeded: ${succeeded}`)
    console.log(`  Failed:    ${failed}`)
    console.log(`  Total:     ${allSkillPaths.length}`)

    if (errors.length > 0) {
      console.log(`\n⚠ Errors:`)
      for (const e of errors.slice(0, 20)) {
        console.log(`  ${e.path}: ${e.error}`)
      }
      if (errors.length > 20) {
        console.log(`  ... and ${errors.length - 20} more`)
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
  const permissions = detectPermissions(skillContent)
  const artifactType = args.artifactType || detectArtifactType(fm.raw, repo)
  const formatStd = usingReadmeFallback ? 'generic' : 'skill_md'
  const platforms = args.platforms || detectPlatforms(fm, skillContent, readme, artifactType, formatStd)
  const { skillType, hasPlugin } = detectSkillType(owner, repo, skillPath, meta.topics, readme)
  const tags = Array.from(new Set([
    ...(fm.tags || []),
    ...meta.topics.slice(0, 10),
    ...extractTagsFromContent(repo, description, readme),
  ])).slice(0, 15)

  // Category
  let categorySlug = args.category || null
  if (!categorySlug) {
    // If detected as a plugin, prefer claude-code-plugins category
    if (hasPlugin) {
      categorySlug = 'claude-code-plugins'
      console.log(`  Auto-detected category: ${categorySlug} (plugin detected)`)
    } else {
      categorySlug = detectCategory(meta.topics, meta.description, repo, readme)
      if (categorySlug) {
        console.log(`  Auto-detected category: ${categorySlug}`)
      }
    }
  }

  let categoryId: string | null = null
  if (categorySlug) {
    categoryId = await getCategoryId(categorySlug)
    if (!categoryId) {
      if (args.category) {
        // Only error out if the user explicitly specified a category
        console.error(`\n✗ Category "${categorySlug}" not found.`)
        const cats = await listCategories()
        console.error('  Available categories:')
        for (const c of cats) {
          console.error(`    ${c.slug.padEnd(24)} ${c.name}`)
        }
        process.exit(1)
      } else {
        console.log(`  Warning: Auto-detected category "${categorySlug}" not found in database, skipping`)
      }
    }
  }

  const githubUrl = subpath
    ? `https://github.com/${owner}/${repo}/tree/${meta.defaultBranch}/${subpath}`
    : `https://github.com/${owner}/${repo}`

  const record = {
    slug,
    name: displayName,
    description: truncateDescription(description),
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
  console.log(`  Category:      ${categorySlug || '(none - assign later)'}`)
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
