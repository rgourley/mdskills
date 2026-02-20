/**
 * Core import logic for importing skills from GitHub repos.
 * Shared between the CLI script and the admin API route.
 */
import { createClient } from '@supabase/supabase-js'

const githubToken = process.env.GITHUB_TOKEN

const githubHeaders: Record<string, string> = {
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'mdskills-importer',
  ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
}

// ── Types ──────────────────────────────────────────────────────

export interface ImportOptions {
  url: string
  slug?: string
  name?: string
  category?: string
  platforms?: string[]
  artifactType?: string
  formatStandard?: string
  dryRun?: boolean
}

export interface ImportResult {
  success: boolean
  slug?: string
  name?: string
  id?: string
  error?: string
  logs: string[]
}

interface Frontmatter {
  name: string
  description: string
  license?: string
  compatibility?: string[]
  tags?: string[]
  body: string
  raw: Record<string, string>
}

// ── Helpers ──────────────────────────────────────────────────────

export function parseGithubUrl(url: string): { owner: string; repo: string; subpath?: string } {
  const cleaned = url.replace(/\.git$/, '').replace(/\/$/, '')

  const urlMatch = cleaned.match(/github\.com\/([^/]+)\/([^/]+?)(?:\/tree\/[^/]+\/(.+))?$/)
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2], subpath: urlMatch[3] }
  }

  const shortMatch = cleaned.match(/^([^/]+)\/([^/]+)$/)
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2] }
  }

  throw new Error(`Cannot parse GitHub URL: ${url}`)
}

async function fetchGitHubRaw(owner: string, repo: string, path: string): Promise<string | null> {
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${path}`
  try {
    const res = await fetch(rawUrl, { headers: { 'User-Agent': 'mdskills-importer' } })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

async function fetchRepoMetadata(owner: string, repo: string) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`
  try {
    const res = await fetch(apiUrl, { headers: githubHeaders })
    if (!res.ok) return null
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
  } catch {
    return null
  }
}

async function discoverSkillMd(
  owner: string,
  repo: string,
  subpath?: string
): Promise<{ content: string; path: string } | null> {
  const searchPaths: string[] = []

  if (subpath) {
    searchPaths.push(`${subpath}/SKILL.md`, `${subpath}/skill.md`)
  }

  searchPaths.push('SKILL.md', 'skill.md', '.claude/skills/SKILL.md', 'skills/SKILL.md')

  for (const path of searchPaths) {
    const content = await fetchGitHubRaw(owner, repo, path)
    if (content) return { content, path }
  }

  const skillsDirs = ['.claude/skills', 'skills']
  for (const dir of skillsDirs) {
    try {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${dir}`
      const res = await fetch(apiUrl, { headers: githubHeaders })
      if (!res.ok) continue
      const items = await res.json()
      if (!Array.isArray(items)) continue

      for (const item of items) {
        if (item.type === 'dir') {
          const skillPath = `${dir}/${item.name}/SKILL.md`
          const content = await fetchGitHubRaw(owner, repo, skillPath)
          if (content) return { content, path: skillPath }
        }
      }
    } catch {
      continue
    }
  }

  return null
}

async function fetchReadme(owner: string, repo: string, skillDir?: string): Promise<string | null> {
  if (skillDir) {
    const dirReadme = await fetchGitHubRaw(owner, repo, `${skillDir}/README.md`)
    if (dirReadme) return dirReadme
  }
  return await fetchGitHubRaw(owner, repo, 'README.md')
}

function parseFrontmatter(content: string): Frontmatter {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { name: '', description: '', body: content, raw: {} }

  const fmBlock = match[1]
  const body = match[2]

  const raw: Record<string, string> = {}
  for (const line of fmBlock.split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.+)$/)
    if (kv) raw[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '')
  }

  const compatLines = fmBlock.match(/compatibility:\s*\n((?:\s+-\s+.+\n?)*)/m)
  const compatibility = compatLines
    ? compatLines[1].match(/- (.+)/g)?.map((m) => m.replace(/^- /, '').trim()) || []
    : raw.compatibility
      ? raw.compatibility.split(',').map((s) => s.trim())
      : []

  const tagLines = fmBlock.match(/tags:\s*\n((?:\s+-\s+.+\n?)*)/m)
  const tags = tagLines
    ? tagLines[1].match(/- (.+)/g)?.map((m) => m.replace(/^- /, '').trim()) || []
    : raw.tags
      ? raw.tags.split(',').map((s) => s.trim())
      : []

  return { name: raw.name || '', description: raw.description || '', license: raw.license, compatibility, tags, body, raw }
}

function descriptionFromReadme(readme: string | null, maxLen = 400): string {
  if (!readme) return ''
  let text = readme
    // Strip HTML tags (including <p>, <h1>, <img>, <a>, badges, etc.)
    .replace(/<[^>]+>/g, ' ')
    // Strip the first markdown heading
    .replace(/^#\s+.+?\n+/m, '')
    // Strip blockquotes (often contain notices, not descriptions)
    .replace(/^>\s*.*$/gm, '')
    // Strip badge/image markdown
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    // Convert link markdown to text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Strip remaining markdown formatting
    .replace(/[*_`#]/g, '')
    .trim()
  const firstBlock = text.split(/\n##\s|\n\n\n/)[0]
  if (!firstBlock) return ''
  return firstBlock
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, maxLen)
}

const ACRONYMS = new Set([
  'ai', 'api', 'aws', 'ci', 'cd', 'cli', 'cms', 'cpu', 'css', 'csv',
  'db', 'dns', 'docx', 'dom', 'gcp', 'gif', 'gpu', 'html', 'http',
  'https', 'ide', 'io', 'ip', 'json', 'jwt', 'llm', 'mcp', 'ml',
  'npm', 'os', 'pdf', 'pptx', 'qa', 'rag', 'rest', 'rpc', 'sdk',
  'seo', 'sql', 'ssh', 'ssl', 'svg', 'tls', 'ui', 'url', 'ux',
  'vm', 'xml', 'xlsx', 'yaml',
])

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

function inferDisplayName(repoName: string, fmName: string, readme: string | null, skillDir?: string): string {
  // If frontmatter has a proper display name (with spaces), use it directly
  if (fmName && fmName.includes(' ')) return fmName

  // If frontmatter has a slug-style name (e.g. "angular-architect"), titleCase it
  // This is a stronger signal than README headings, especially in multi-skill repos
  if (fmName && (fmName.includes('-') || fmName.includes('_'))) return titleCase(fmName)

  const dirName = skillDir?.split('/').pop()

  if (readme) {
    // Check HTML headings first: <h1>Title</h1> or <h1 align="center">Title</h1>
    // (many repos use HTML h1 at the very top, with markdown # appearing later for code examples)
    const htmlHeading = readme.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim()
    // Check markdown headings: # Title (first occurrence)
    const mdHeading = readme.match(/^#\s+(.+)/m)?.[1]?.trim()
    const readmeHeading = htmlHeading || mdHeading
    if (readmeHeading && readmeHeading.length < 80) {
      const clean = readmeHeading
        .replace(/[*_`]/g, '')
        .replace(/^\W+/, '')
        .trim()
      // Use the heading — it's the properly-cased display name
      if (clean) return clean
    }
  }

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

// Format-specific client mappings — these formats only work with specific clients
const FORMAT_SPECIFIC_CLIENTS: Record<string, string[]> = {
  cursorrules: ['cursor'],
  mdc: ['cursor'],
  claude_md: ['claude-code', 'claude-desktop'],
  copilot_instructions: ['vscode-copilot', 'github'],
  gemini_md: ['gemini', 'gemini-cli'],
  windsurf_rules: ['windsurf'],
  clinerules: ['roo-code'],
}

function detectPlatforms(fm: Frontmatter, skillContent: string, readme: string | null, artifactType?: string, formatStandard?: string): string[] {
  // If frontmatter explicitly declares compatibility, respect that
  if (fm.compatibility && fm.compatibility.length > 0) {
    const mapped = fm.compatibility.map((c) => c.toLowerCase().replace(/\s+/g, '-'))
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

  // Generic markdown skills (SKILL.md, AGENTS.md, generic) work with all markdown-consuming clients
  // Also scan content for additional platform-specific mentions
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

function detectArtifactType(fmRaw: Record<string, string>, repoName: string): string {
  const fmType = fmRaw.type?.toLowerCase() || fmRaw.artifact_type?.toLowerCase() || ''
  if (fmType.includes('mcp')) return 'mcp_server'
  if (fmType.includes('rule')) return 'ruleset'
  if (fmType.includes('workflow')) return 'workflow_pack'
  if (fmType.includes('template') || fmType.includes('starter')) return 'template_bundle'

  const lower = repoName.toLowerCase()
  if (/^mcp[-_]|[-_]mcp$|mcp[-_]server|mcp/.test(lower)) return 'mcp_server'
  if (/cursorrules|\.cursorrules/.test(lower)) return 'ruleset'
  if (/template|starter|scaffold/.test(lower)) return 'template_bundle'

  return 'skill_pack'
}

function detectSkillType(skillPath: string, topics?: string[], readme?: string | null): { skillType: string; hasPlugin: boolean } {
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

function generateSlug(repo: string, skillPath: string): string {
  if (skillPath === 'README.md' || skillPath === 'AGENTS.md') {
    return repo.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  }

  const parts = skillPath.replace('/SKILL.md', '').replace('/skill.md', '').split('/')
  const dirName = parts[parts.length - 1] || repo

  const genericNames = ['skills', '.claude', 'src', 'lib', 'root']
  const base = genericNames.includes(dirName.toLowerCase()) ? repo : dirName

  return base.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

// ── Category auto-detection ──────────────────────────────────────

/** Map of category slugs to keywords that signal that category */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'claude-code-plugins': ['claude code plugin', 'claude plugin', 'claude-code plugin', 'slash-commands', 'claude code skills', 'claude code hooks'],
  'code-review': ['code review', 'lint', 'linting', 'eslint', 'prettier', 'code quality', 'static analysis', 'code style'],
  'documentation': ['documentation', 'docs', 'readme', 'jsdoc', 'typedoc', 'api docs', 'docstring'],
  'testing': ['testing', 'test', 'jest', 'mocha', 'pytest', 'unit test', 'e2e', 'qa', 'quality assurance', 'playwright', 'cypress', 'vitest'],
  'security': ['security', 'vulnerability', 'audit', 'cve', 'owasp', 'pentest', 'encryption', 'auth', 'authentication'],
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
  // Build a single searchable text blob from all signals
  const text = [
    ...topics,
    description,
    repoName.replace(/[-_]/g, ' '),
    // Only use first ~500 chars of readme to avoid false positives from long docs
    (readme || '').slice(0, 500),
  ].join(' ').toLowerCase()

  // Score each category by keyword matches
  let bestCategory: string | null = null
  let bestScore = 0

  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0
    for (const kw of keywords) {
      if (text.includes(kw)) {
        // Topics get a stronger signal (they're intentionally chosen by the author)
        score += topics.some(t => t.toLowerCase().includes(kw)) ? 3 : 1
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestCategory = slug
    }
  }

  // Require at least 2 points to avoid weak matches
  return bestScore >= 2 ? bestCategory : null
}

// ── Main import function ─────────────────────────────────────────

export async function importSkill(opts: ImportOptions): Promise<ImportResult> {
  const logs: string[] = []
  const log = (msg: string) => logs.push(msg)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return { success: false, error: 'Missing Supabase credentials', logs }
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  // Parse URL
  let owner: string, repo: string, subpath: string | undefined
  try {
    const parsed = parseGithubUrl(opts.url)
    owner = parsed.owner
    repo = parsed.repo
    subpath = parsed.subpath
  } catch (err) {
    return { success: false, error: `Invalid GitHub URL: ${opts.url}`, logs }
  }

  log(`Importing from: ${owner}/${repo}${subpath ? `/${subpath}` : ''}`)

  // 1. Fetch repo metadata
  log('Fetching repo metadata...')
  const meta = await fetchRepoMetadata(owner, repo)
  if (!meta) {
    return { success: false, error: 'Could not fetch repo metadata. Is the repo public?', logs }
  }
  log(`${meta.stars} stars, ${meta.forks} forks, license: ${meta.license || 'none'}`)

  // 2. Discover SKILL.md
  log('Searching for SKILL.md...')
  const skill = await discoverSkillMd(owner, repo, subpath)
  let skillDir: string | undefined
  let fm: Frontmatter
  let readme: string | null
  let usingReadmeFallback = false

  if (skill) {
    log(`Found: ${skill.path} (${skill.content.length} bytes)`)
    skillDir = skill.path.includes('/') ? skill.path.split('/').slice(0, -1).join('/') : undefined
    fm = parseFrontmatter(skill.content)
    log(`Frontmatter: name="${fm.name}", desc="${fm.description.slice(0, 60)}..."`)
    readme = await fetchReadme(owner, repo, skillDir)
    log(readme ? `README: ${readme.length} bytes` : 'No README found')
  } else {
    log('No SKILL.md found - falling back to README-based import')

    const agentsMd = await fetchGitHubRaw(owner, repo, 'AGENTS.md')
    if (agentsMd) log('Found AGENTS.md - using as skill content')

    readme = await fetchReadme(owner, repo, subpath)
    if (!readme) {
      return { success: false, error: 'No SKILL.md or README.md found. Cannot import.', logs }
    }
    log(`README: ${readme.length} bytes`)
    fm = parseFrontmatter(agentsMd || readme)
    usingReadmeFallback = true
  }

  // 3. Build record
  const skillPath = skill?.path || 'README.md'
  const skillContent = skill?.content || readme || ''
  const slug = opts.slug || generateSlug(repo, skillPath)
  const displayName = opts.name || inferDisplayName(repo, fm.name, readme, skillDir)
  const description = (fm.description || descriptionFromReadme(readme) || meta.description || `${displayName} - AI agent skill`).slice(0, 500)
  const permissions = detectPermissions(skillContent)
  const artifactType = opts.artifactType || detectArtifactType(fm.raw, repo)
  const formatStandard = opts.formatStandard || (usingReadmeFallback ? 'generic' : 'skill_md')
  const platforms = opts.platforms || detectPlatforms(fm, skillContent, readme, artifactType, formatStandard)
  const { skillType, hasPlugin } = detectSkillType(skillPath, meta.topics, readme)
  const tags = Array.from(new Set([...(fm.tags || []), ...meta.topics.slice(0, 10)])).slice(0, 15)

  let categorySlug = opts.category || null
  if (!categorySlug) {
    // If detected as a plugin, prefer claude-code-plugins category
    if (hasPlugin) {
      categorySlug = 'claude-code-plugins'
      log(`Auto-detected category: ${categorySlug} (plugin detected)`)
    } else {
      categorySlug = detectCategory(meta.topics, meta.description, repo, readme)
      if (categorySlug) {
        log(`Auto-detected category: ${categorySlug}`)
      }
    }
  }

  let categoryId: string | null = null
  if (categorySlug) {
    const { data } = await supabase.from('categories').select('id').eq('slug', categorySlug).single()
    categoryId = data?.id ?? null
    if (!categoryId) {
      log(`Warning: Category "${categorySlug}" not found`)
    }
  }

  const githubUrl = subpath
    ? `https://github.com/${owner}/${repo}/tree/${meta.defaultBranch}/${subpath}`
    : `https://github.com/${owner}/${repo}`

  const record = {
    slug,
    name: displayName,
    description,
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
    format_standard: formatStandard,
    ...permissions,
  }

  log(`Slug: ${record.slug}`)
  log(`Name: ${record.name}`)
  log(`Type: ${record.artifact_type}`)
  log(`Platforms: ${record.platforms.join(', ')}`)
  log(`Stars: ${record.github_stars}`)

  if (opts.dryRun) {
    log('Dry run - nothing written to database')
    return { success: true, slug: record.slug, name: record.name, logs }
  }

  // 4. Upsert to database
  log('Writing to database...')
  const { data, error } = await supabase
    .from('skills')
    .upsert(record, { onConflict: 'slug' })
    .select('id, slug, name')
    .single()

  if (error) {
    return { success: false, error: `Database error: ${error.message}`, logs }
  }
  log(`Saved: ${data.name} (id: ${data.id})`)

  // 5. Link to clients
  if (data.id) {
    log('Linking to clients...')
    const clientSlugs = [...record.platforms]
    if (!clientSlugs.includes('claude-code')) clientSlugs.unshift('claude-code')

    for (const clientSlug of clientSlugs) {
      const { data: client } = await supabase.from('clients').select('id').eq('slug', clientSlug).single()

      if (client) {
        let instructions: string
        if (artifactType === 'mcp_server') {
          const npmPackage = repo
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
          { skill_id: data.id, client_id: client.id, install_instructions: instructions, is_primary: clientSlug === 'claude-code' },
          { onConflict: 'skill_id,client_id' }
        )
        log(`Linked: ${clientSlug}`)
      } else {
        log(`Client not found: ${clientSlug}`)
      }
    }
  }

  log(`Done! View at: /skills/${record.slug}`)
  return { success: true, slug: record.slug, name: record.name, id: data.id, logs }
}
