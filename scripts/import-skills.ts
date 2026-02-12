/**
 * Import skills from GitHub into Supabase.
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and optionally GITHUB_TOKEN (for higher rate limits).
 * Run: npm run import  (or tsx scripts/import-skills.ts)
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const githubToken = process.env.GITHUB_TOKEN;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const octokit = new Octokit(githubToken ? { auth: githubToken } : {});

// Only public repos that exist. (vercel-labs/ai-sdk-preview-* were removed — they return 404.)
const SKILLS_TO_IMPORT = [
  { githubUrl: 'https://github.com/modelcontextprotocol/servers', skillPath: 'src/brave-search', category: 'code-review', featured: true },
  { githubUrl: 'https://github.com/anthropics/anthropic-quickstarts', skillPath: 'customer-support-agent', category: 'code-review', featured: true },
  { githubUrl: 'https://github.com/modelcontextprotocol/servers', skillPath: 'src/github', category: 'documentation', featured: true },
  { githubUrl: 'https://github.com/modelcontextprotocol/servers', skillPath: 'src/filesystem', category: 'documentation', featured: false },
  { githubUrl: 'https://github.com/anthropics/anthropic-quickstarts', skillPath: 'financial-data-analyzer', category: 'documentation', featured: false },
  { githubUrl: 'https://github.com/modelcontextprotocol/servers', skillPath: 'src/puppeteer', category: 'testing', featured: true },
  { githubUrl: 'https://github.com/modelcontextprotocol/servers', skillPath: 'src/playwright', category: 'testing', featured: false },
  { githubUrl: 'https://github.com/anthropics/anthropic-quickstarts', skillPath: 'computer-use-demo', category: 'testing', featured: false },
  { githubUrl: 'https://github.com/modelcontextprotocol/servers', skillPath: 'src/git', category: 'security', featured: true },
  { githubUrl: 'https://github.com/modelcontextprotocol/servers', skillPath: 'src/sqlite', category: 'security', featured: false },
  { githubUrl: 'https://github.com/anthropics/anthropic-quickstarts', skillPath: 'github-bot', category: 'security', featured: false },
  { githubUrl: 'https://github.com/modelcontextprotocol/servers', skillPath: 'src/fetch', category: 'api-development', featured: true },
  { githubUrl: 'https://github.com/modelcontextprotocol/servers', skillPath: 'src/postgres', category: 'api-development', featured: false },
  { githubUrl: 'https://github.com/modelcontextprotocol/servers', skillPath: 'src/memory', category: 'data-analysis', featured: true },
  { githubUrl: 'https://github.com/modelcontextprotocol/servers', skillPath: 'src/google-maps', category: 'data-analysis', featured: false },
  { githubUrl: 'https://github.com/anthropics/anthropic-quickstarts', skillPath: 'financial-data-analyzer', category: 'data-analysis', featured: false },
  { githubUrl: 'https://github.com/modelcontextprotocol/servers', skillPath: 'src/slack', category: 'productivity', featured: true },
  { githubUrl: 'https://github.com/modelcontextprotocol/servers', skillPath: 'src/google-drive', category: 'productivity', featured: false },
  { githubUrl: 'https://github.com/modelcontextprotocol/servers', skillPath: 'src/sentry', category: 'productivity', featured: false },
  { githubUrl: 'https://github.com/anthropics/anthropic-quickstarts', skillPath: 'customer-support-agent', category: 'productivity', featured: false },
  { githubUrl: 'https://github.com/modelcontextprotocol/servers', skillPath: 'src/everything', category: 'creative', featured: false },
];

function inferDisplayName(slug: string, description?: string, readmeHeading?: string): string {
  if (readmeHeading) return readmeHeading.replace(/^#\s+/, '').trim();
  if (description && description.length < 100 && !description.includes('.')) return description;
  return slug
    .replace(/^(vercel|anthropic|openai|claude|ai-sdk-preview)-/, '')
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

function parseGithubUrl(url: string): { owner: string; repo: string } {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error(`Invalid GitHub URL: ${url}`);
  return { owner: match[1], repo: match[2] };
}

/** Unique slug per (owner, repo, path) to avoid duplicates. */
function buildSlug(owner: string, repo: string, skillPath: string): string {
  const pathPart = (skillPath || 'root').replace(/\//g, '-').replace(/^-|-$/g, '');
  return `${owner}-${repo}-${pathPart}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `${owner}-${repo}-root`;
}

async function fetchFileContent(owner: string, repo: string, path: string): Promise<string | null> {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    if ('content' in data && typeof data.content === 'string') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ Failed to fetch ${path}: ${msg}`);
    return null;
  }
}

async function fetchRepoMetadata(owner: string, repo: string) {
  try {
    const { data } = await octokit.repos.get({ owner, repo });
    return {
      description: data.description || '',
      stars: data.stargazers_count,
      forks: data.forks_count,
      topics: data.topics || [],
      license: data.license?.spdx_id || null,
      updatedAt: data.updated_at,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ Failed to fetch repo metadata: ${msg}`);
    return null;
  }
}

async function getCategoryId(slug: string): Promise<string | null> {
  const { data } = await supabase.from('categories').select('id').eq('slug', slug).single();
  return data?.id ?? null;
}

function createDefaultSkillMd(displayName: string, description: string): string {
  return `# ${displayName}

## Description
${description || 'AI skill for enhanced productivity'}

## Instructions
1. Analyze the input
2. Process according to requirements
3. Return formatted results

## Output Format
- Clear, structured response
- Actionable insights
- Relevant examples
`;
}

async function importSkill(
  config: (typeof SKILLS_TO_IMPORT)[0],
  index: number
): Promise<boolean> {
  const { owner, repo } = parseGithubUrl(config.githubUrl);
  const skillPath = config.skillPath || '';

  console.log(`\n[${index + 1}/${SKILLS_TO_IMPORT.length}] Importing: ${owner}/${repo}${skillPath ? '/' + skillPath : ''}`);

  const metadata = await fetchRepoMetadata(owner, repo);
  if (!metadata) {
    console.log(`  ✗ Skipping - failed to fetch metadata`);
    return false;
  }
  console.log(`  ✓ Fetched metadata (${metadata.stars} stars)`);

  const possiblePaths = [
    skillPath ? `${skillPath}/SKILL.md` : 'SKILL.md',
    skillPath ? `${skillPath}/skill.md` : 'skill.md',
    skillPath ? `${skillPath}/README.md` : 'README.md',
  ];
  let skillContent: string | null = null;
  for (const path of possiblePaths) {
    skillContent = await fetchFileContent(owner, repo, path);
    if (skillContent) {
      console.log(`  ✓ Fetched content from ${path} (${skillContent.length} chars)`);
      break;
    }
  }

  const readmePath = skillPath ? `${skillPath}/README.md` : 'README.md';
  const readme = skillContent || (await fetchFileContent(owner, repo, readmePath));
  const readmeHeading = readme?.match(/^#\s+(.+)/m)?.[1];

  const slug = buildSlug(owner, repo, skillPath);
  const displayName = inferDisplayName(slug, metadata.description, readmeHeading);
  console.log(`  ✓ Slug: ${slug} | Display name: "${displayName}"`);

  const categoryId = await getCategoryId(config.category);
  if (!categoryId) {
    console.log(`  ✗ Category not found: ${config.category}`);
    return false;
  }

  const descMatch = skillContent?.match(/##\s+Description\s+([\s\S]+?)(?=\n##|$)/);
  const description = (descMatch?.[1].trim() || metadata.description || displayName).slice(0, 500);

  if (!skillContent) {
    console.log(`  ⚠ No SKILL.md found, using default template`);
    skillContent = createDefaultSkillMd(displayName, description);
  }

  const githubUrlFull =
    skillPath
      ? `https://github.com/${owner}/${repo}/tree/main/${skillPath}`.replace(/\/tree\/main\/$/, '')
      : `https://github.com/${owner}/${repo}`;

  const { error } = await supabase.from('skills').insert({
    slug,
    name: displayName,
    description,
    owner,
    repo,
    skill_path: skillPath || repo,
    content: skillContent,
    status: 'published',
    featured: config.featured,
    category_id: categoryId,
    author_username: owner,
    github_url: githubUrlFull,
    github_stars: metadata.stars,
    github_forks: metadata.forks,
    license: metadata.license,
    platforms: ['claude', 'codex', 'cursor'],
    tags: metadata.topics.slice(0, 10),
    weekly_installs: 0,
    mdskills_upvotes: 0,
    mdskills_forks: 0,
  });

  if (error) {
    if (error.code === '23505') {
      console.log(`  ⚠ Skill already exists (${slug}), skipping`);
      return true;
    }
    console.log(`  ✗ Database error: ${error.message}`);
    return false;
  }
  console.log(`  ✓ Saved to database`);
  return true;
}

async function main() {
  console.log('🚀 Starting GitHub import...\n');
  console.log(`Importing ${SKILLS_TO_IMPORT.length} skills\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < SKILLS_TO_IMPORT.length; i++) {
    try {
      const ok = await importSkill(SKILLS_TO_IMPORT[i], i);
      if (ok) successCount++;
      else errorCount++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ Error: ${msg}`);
      errorCount++;
    }
    if (i < SKILLS_TO_IMPORT.length - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Errors: ${errorCount}`);
  console.log(`\nNext: Visit http://localhost:3000 to see your skills!`);
}

main().catch(console.error);
