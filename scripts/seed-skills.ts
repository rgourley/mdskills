/**
 * Seed real SKILL.md agent skills by fetching content directly from GitHub.
 * Run: npm run seed:skills
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

interface SkillDef {
  slug: string;
  display_name: string;
  owner: string;
  repo: string;
  skill_path: string;
  category_slug: string;
  license: string;
  format_standard: string;
  platforms: string[];
  tags: string[];
  difficulty: string;
  perm_filesystem_read: boolean;
  perm_filesystem_write: boolean;
  perm_shell_exec: boolean;
  perm_network_access: boolean;
  perm_git_write: boolean;
  client_instructions: { slug: string; instructions: string; primary: boolean }[];
}

const githubToken = process.env.GITHUB_TOKEN;

/** Fetch a raw file from GitHub */
async function fetchGitHubFile(owner: string, repo: string, path: string): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Cache for repo stats (avoids repeated API calls for same repo) */
const repoStatsCache = new Map<string, { stars: number; forks: number }>();

/** Fetch stars/forks from GitHub API (cached per owner/repo) */
async function fetchRepoStats(owner: string, repo: string): Promise<{ stars: number; forks: number }> {
  const key = `${owner}/${repo}`;
  if (repoStatsCache.has(key)) return repoStatsCache.get(key)!;

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'mdskills-seeder',
    };
    if (githubToken) headers['Authorization'] = `Bearer ${githubToken}`;

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!res.ok) {
      console.log(`  ⚠ GitHub API ${res.status} for ${key}, using 0 stars/forks`);
      const fallback = { stars: 0, forks: 0 };
      repoStatsCache.set(key, fallback);
      return fallback;
    }
    const data = await res.json();
    const stats = {
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
    };
    repoStatsCache.set(key, stats);
    console.log(`  ✓ GitHub: ${stats.stars} stars, ${stats.forks} forks`);
    return stats;
  } catch {
    const fallback = { stars: 0, forks: 0 };
    repoStatsCache.set(key, fallback);
    return fallback;
  }
}

/** Fetch SKILL.md from GitHub (tries multiple paths) */
async function fetchSkillMd(owner: string, repo: string, skillPath: string): Promise<string | null> {
  return await fetchGitHubFile(owner, repo, `${skillPath}/SKILL.md`);
}

/** Fetch README.md from GitHub (tries skill path first, then repo root) */
async function fetchReadme(owner: string, repo: string, skillPath: string): Promise<string | null> {
  // Try skill-level README first
  const skillReadme = await fetchGitHubFile(owner, repo, `${skillPath}/README.md`);
  if (skillReadme) return skillReadme;
  // Fall back to repo root README
  return await fetchGitHubFile(owner, repo, 'README.md');
}

/** Parse YAML frontmatter from SKILL.md content */
function parseFrontmatter(content: string): { name: string; description: string; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { name: '', description: '', body: content };

  const frontmatter = match[1];
  const body = match[2];

  // Extract name
  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const name = nameMatch ? nameMatch[1].trim().replace(/^["']|["']$/g, '') : '';

  // Extract description (may be multiline)
  const descMatch = frontmatter.match(/^description:\s*["']?([\s\S]*?)(?:(?:\n\w)|$)/m);
  let description = '';
  if (descMatch) {
    description = descMatch[1].trim().replace(/^["']|["']$/g, '');
  }

  return { name, description, body };
}

const SKILLS: SkillDef[] = [
  // ── Anthropic Official Skills ─────────────────────────────────
  {
    slug: 'pdf-processing',
    display_name: 'PDF Processing',
    owner: 'anthropics',
    repo: 'skills',
    skill_path: 'skills/pdf',
    category_slug: 'content-creation',
    license: 'Proprietary',
    format_standard: 'skill_md',
    platforms: ['claude-code'],
    tags: ['pdf', 'document-processing', 'text-extraction', 'forms', 'official'],
    difficulty: 'beginner',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: false,
    perm_git_write: false,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Built into Claude Code. Activates when working with PDF files.', primary: true },
    ],
  },
  {
    slug: 'docx-documents',
    display_name: 'Word Documents (DOCX)',
    owner: 'anthropics',
    repo: 'skills',
    skill_path: 'skills/docx',
    category_slug: 'content-creation',
    license: 'Proprietary',
    format_standard: 'skill_md',
    platforms: ['claude-code'],
    tags: ['docx', 'word', 'document-creation', 'official'],
    difficulty: 'beginner',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: false,
    perm_git_write: false,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Built into Claude Code. Activates when working with Word documents.', primary: true },
    ],
  },
  {
    slug: 'spreadsheets-xlsx',
    display_name: 'Spreadsheets (XLSX)',
    owner: 'anthropics',
    repo: 'skills',
    skill_path: 'skills/xlsx',
    category_slug: 'content-creation',
    license: 'Proprietary',
    format_standard: 'skill_md',
    platforms: ['claude-code'],
    tags: ['xlsx', 'excel', 'spreadsheets', 'data', 'official'],
    difficulty: 'beginner',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: false,
    perm_git_write: false,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Built into Claude Code. Activates when working with spreadsheets.', primary: true },
    ],
  },
  {
    slug: 'presentations-pptx',
    display_name: 'Presentations (PPTX)',
    owner: 'anthropics',
    repo: 'skills',
    skill_path: 'skills/pptx',
    category_slug: 'content-creation',
    license: 'Proprietary',
    format_standard: 'skill_md',
    platforms: ['claude-code'],
    tags: ['pptx', 'powerpoint', 'presentations', 'slides', 'official'],
    difficulty: 'beginner',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: false,
    perm_git_write: false,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Built into Claude Code. Activates when working with presentations.', primary: true },
    ],
  },
  {
    slug: 'mcp-builder',
    display_name: 'MCP Server Builder',
    owner: 'anthropics',
    repo: 'skills',
    skill_path: 'skills/mcp-builder',
    category_slug: 'code-generation',
    license: 'Proprietary',
    format_standard: 'skill_md',
    platforms: ['claude-code'],
    tags: ['mcp', 'model-context-protocol', 'server-builder', 'official'],
    difficulty: 'intermediate',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: true,
    perm_git_write: false,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Built into Claude Code. Ask Claude to "build an MCP server" to activate.', primary: true },
    ],
  },
  {
    slug: 'webapp-testing',
    display_name: 'Web App Testing',
    owner: 'anthropics',
    repo: 'skills',
    skill_path: 'skills/webapp-testing',
    category_slug: 'testing-qa',
    license: 'Proprietary',
    format_standard: 'skill_md',
    platforms: ['claude-code'],
    tags: ['testing', 'playwright', 'web-testing', 'browser', 'official'],
    difficulty: 'intermediate',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: true,
    perm_git_write: false,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Built into Claude Code. Activates when testing web applications.', primary: true },
    ],
  },
  {
    slug: 'skill-creator',
    display_name: 'Skill Creator',
    owner: 'anthropics',
    repo: 'skills',
    skill_path: 'skills/skill-creator',
    category_slug: 'code-generation',
    license: 'Proprietary',
    format_standard: 'skill_md',
    platforms: ['claude-code'],
    tags: ['skill-authoring', 'meta', 'official'],
    difficulty: 'intermediate',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: false,
    perm_network_access: false,
    perm_git_write: false,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Built into Claude Code. Ask Claude to "create a new skill" to activate.', primary: true },
    ],
  },
  {
    slug: 'algorithmic-art',
    display_name: 'Algorithmic Art',
    owner: 'anthropics',
    repo: 'skills',
    skill_path: 'skills/algorithmic-art',
    category_slug: 'design-systems',
    license: 'Proprietary',
    format_standard: 'skill_md',
    platforms: ['claude-code'],
    tags: ['generative-art', 'p5js', 'creative-coding', 'visual-design', 'official'],
    difficulty: 'intermediate',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: false,
    perm_git_write: false,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Built into Claude Code. Ask Claude to "create algorithmic art" to activate.', primary: true },
    ],
  },
  {
    slug: 'frontend-design',
    display_name: 'Frontend Design',
    owner: 'anthropics',
    repo: 'skills',
    skill_path: 'skills/frontend-design',
    category_slug: 'design-systems',
    license: 'Proprietary',
    format_standard: 'skill_md',
    platforms: ['claude-code'],
    tags: ['frontend', 'css', 'ui-design', 'responsive', 'accessibility', 'official'],
    difficulty: 'beginner',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: false,
    perm_network_access: false,
    perm_git_write: false,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Built into Claude Code. Activates when building UI components.', primary: true },
    ],
  },

  // ── Vercel Skills ─────────────────────────────────────────────
  {
    slug: 'react-best-practices',
    display_name: 'React Best Practices',
    owner: 'vercel-labs',
    repo: 'agent-skills',
    skill_path: 'skills/react-best-practices',
    category_slug: 'code-generation',
    license: 'MIT',
    format_standard: 'skill_md',
    platforms: ['claude-code', 'cursor', 'codex'],
    tags: ['react', 'nextjs', 'performance', 'vercel', 'official'],
    difficulty: 'intermediate',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: false,
    perm_network_access: false,
    perm_git_write: false,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Install:\ngit clone https://github.com/vercel-labs/agent-skills\nThe skill activates automatically when working on React/Next.js code.', primary: true },
    ],
  },

  // ── Cloudflare Skills ─────────────────────────────────────────
  {
    slug: 'cloudflare-wrangler',
    display_name: 'Cloudflare Wrangler',
    owner: 'cloudflare',
    repo: 'skills',
    skill_path: 'skills/wrangler',
    category_slug: 'devops-ci-cd',
    license: 'Apache-2.0',
    format_standard: 'skill_md',
    platforms: ['claude-code', 'cursor', 'codex'],
    tags: ['cloudflare', 'workers', 'wrangler', 'edge', 'serverless', 'official'],
    difficulty: 'intermediate',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: true,
    perm_git_write: false,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Install:\ngit clone https://github.com/cloudflare/skills\nClaude will use wrangler commands to manage Workers.', primary: true },
    ],
  },

  // ── Stripe Skills ─────────────────────────────────────────────
  {
    slug: 'stripe-best-practices',
    display_name: 'Stripe Best Practices',
    owner: 'stripe',
    repo: 'ai',
    skill_path: 'skills/stripe-best-practices',
    category_slug: 'code-generation',
    license: 'MIT',
    format_standard: 'skill_md',
    platforms: ['claude-code', 'cursor', 'codex'],
    tags: ['stripe', 'payments', 'checkout', 'subscriptions', 'webhooks', 'official'],
    difficulty: 'intermediate',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: true,
    perm_git_write: false,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Install:\ngit clone https://github.com/stripe/ai\nClaude will apply Stripe best practices when generating payment code.', primary: true },
    ],
  },

  // ── Hugging Face Skills ───────────────────────────────────────
  {
    slug: 'huggingface-cli',
    display_name: 'Hugging Face CLI',
    owner: 'huggingface',
    repo: 'skills',
    skill_path: 'skills/hugging-face-cli',
    category_slug: 'research-analysis',
    license: 'Apache-2.0',
    format_standard: 'skill_md',
    platforms: ['claude-code', 'cursor', 'codex'],
    tags: ['huggingface', 'models', 'datasets', 'ml', 'inference', 'official'],
    difficulty: 'intermediate',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: true,
    perm_git_write: false,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Install:\ngit clone https://github.com/huggingface/skills\nEnsure the hf CLI is installed: pip install huggingface_hub[cli]', primary: true },
    ],
  },
];

async function getCategoryId(slug: string): Promise<string | null> {
  const { data } = await supabase.from('categories').select('id').eq('slug', slug).single();
  return data?.id ?? null;
}

async function seedSkill(def: SkillDef): Promise<boolean> {
  console.log(`\nFetching: ${def.owner}/${def.repo} → ${def.skill_path}`);

  const [rawContent, readmeContent] = await Promise.all([
    fetchSkillMd(def.owner, def.repo, def.skill_path),
    fetchReadme(def.owner, def.repo, def.skill_path),
  ]);
  if (!rawContent) {
    console.log(`  ✗ Could not fetch SKILL.md`);
    return false;
  }
  console.log(`  ✓ SKILL.md: ${rawContent.length} bytes`);
  console.log(`  ${readmeContent ? `✓ README: ${readmeContent.length} bytes` : '⚠ No README found'}`);

  const { name, description, body } = parseFrontmatter(rawContent);
  const displayName = def.display_name;
  const desc = description || `Skill from ${def.owner}/${def.repo}`;

  console.log(`  Name: ${displayName}`);
  console.log(`  Description: ${desc.slice(0, 80)}...`);

  const [categoryId, repoStats] = await Promise.all([
    getCategoryId(def.category_slug),
    fetchRepoStats(def.owner, def.repo),
  ]);

  const { data, error } = await supabase
    .from('skills')
    .upsert({
      slug: def.slug,
      name: displayName,
      description: desc,
      owner: def.owner,
      repo: def.repo,
      skill_path: def.skill_path,
      github_url: `https://github.com/${def.owner}/${def.repo}/tree/main/${def.skill_path}`,
      content: rawContent,
      readme: readmeContent,
      status: 'published',
      featured: true,
      skill_type: 'skill',
      has_plugin: false,
      has_examples: true,
      difficulty: def.difficulty,
      category_id: categoryId,
      author_username: def.owner,
      github_stars: repoStats.stars,
      github_forks: repoStats.forks,
      license: def.license,
      weekly_installs: 0,
      mdskills_upvotes: 0,
      mdskills_forks: 0,
      platforms: def.platforms,
      tags: def.tags,
      artifact_type: 'skill_pack',
      format_standard: def.format_standard,
      perm_filesystem_read: def.perm_filesystem_read,
      perm_filesystem_write: def.perm_filesystem_write,
      perm_shell_exec: def.perm_shell_exec,
      perm_network_access: def.perm_network_access,
      perm_git_write: def.perm_git_write,
    }, { onConflict: 'slug' })
    .select('id, slug, name')
    .single();

  if (error) {
    console.log(`  ✗ DB Error: ${error.message}`);
    return false;
  }
  console.log(`  ✓ Saved: ${data?.name}`);

  // Populate listing_clients
  if (data?.id && def.client_instructions.length > 0) {
    for (const ci of def.client_instructions) {
      const { data: client } = await supabase.from('clients').select('id').eq('slug', ci.slug).single();
      if (client) {
        await supabase.from('listing_clients').upsert({
          skill_id: data.id,
          client_id: client.id,
          install_instructions: ci.instructions,
          is_primary: ci.primary,
        }, { onConflict: 'skill_id,client_id' });
        console.log(`    → ${ci.slug}`);
      }
    }
  }

  return true;
}

async function main() {
  console.log('🌱 Seeding skills from GitHub (real SKILL.md content)...\n');

  let success = 0;
  let failed = 0;

  for (const def of SKILLS) {
    const ok = await seedSkill(def);
    if (ok) success++;
    else failed++;
  }

  console.log(`\n✅ Done! ${success} skills seeded, ${failed} failed.`);
}

main().catch(console.error);
