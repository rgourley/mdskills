/**
 * Seed the interface-design plugin skill with real SKILL.md content from GitHub.
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 * Run: npm run seed:interface-design
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

async function fetchGitHubFile(path: string): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/Dammyjay93/interface-design/main/${path}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`  ⚠ HTTP ${res.status} fetching ${path}`);
      return null;
    }
    return await res.text();
  } catch {
    console.log(`  ⚠ Failed to fetch ${path}`);
    return null;
  }
}

async function fetchSkillMd(): Promise<string | null> {
  return fetchGitHubFile('.claude/skills/interface-design/SKILL.md');
}

async function fetchReadme(): Promise<string | null> {
  return fetchGitHubFile('README.md');
}

/** Parse YAML frontmatter */
function parseFrontmatter(content: string): { name: string; description: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { name: '', description: '' };
  const fm = match[1];
  const nameMatch = fm.match(/^name:\s*(.+)$/m);
  const descMatch = fm.match(/^description:\s*(.+)$/m);
  return {
    name: nameMatch ? nameMatch[1].trim() : '',
    description: descMatch ? descMatch[1].trim() : '',
  };
}

async function main() {
  console.log('Fetching real SKILL.md and README from Dammyjay93/interface-design...');

  const [content, readmeContent] = await Promise.all([
    fetchSkillMd(),
    fetchReadme(),
  ]);
  if (!content) {
    console.error('Failed to fetch SKILL.md');
    process.exit(1);
  }
  console.log(`✓ SKILL.md: ${content.length} bytes`);
  console.log(`${readmeContent ? `✓ README: ${readmeContent.length} bytes` : '⚠ No README found'}`);

  const { name, description } = parseFrontmatter(content);
  console.log(`  Name: ${name}`);
  console.log(`  Description: ${description.slice(0, 80)}...`);

  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'design-frontend')
    .single();

  // Also try design-systems if design-frontend doesn't exist
  let categoryId = cat?.id ?? null;
  if (!categoryId) {
    const { data: cat2 } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'design-systems')
      .single();
    categoryId = cat2?.id ?? null;
  }

  const skill = {
    slug: 'interface-design',
    name: 'Interface Design',
    description: description || 'Build interface design with craft and consistency. For dashboards, admin panels, apps, tools, and interactive products.',
    owner: 'Dammyjay93',
    repo: 'interface-design',
    skill_path: '.claude/skills/interface-design',
    github_url: 'https://github.com/Dammyjay93/interface-design',
    status: 'published',
    featured: true,
    skill_type: 'hybrid',
    has_plugin: true,
    has_examples: true,
    difficulty: 'beginner',
    category_id: categoryId,
    author_username: 'Dammyjay93',
    weekly_installs: 0,
    mdskills_upvotes: 0,
    mdskills_forks: 0,
    github_stars: 0,
    github_forks: 0,
    license: 'MIT',
    artifact_type: 'skill_pack',
    format_standard: 'skill_md',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: false,
    perm_network_access: false,
    perm_git_write: false,
    tags: ['design-systems', 'ui-design', 'frontend', 'professional-design', 'consistency', 'dashboards'],
    platforms: ['claude-code', 'claude-desktop', 'cursor', 'windsurf', 'codex'],
    content,
    readme: readmeContent,
  };

  const { data, error } = await supabase
    .from('skills')
    .upsert(skill, { onConflict: 'slug' })
    .select('id, slug, name')
    .single();

  if (error) {
    console.error('Insert failed:', error.message);
    process.exit(1);
  }
  console.log(`✓ Saved: ${data?.name} (slug: ${data?.slug})`);

  // Populate listing_clients with per-client install instructions
  if (data?.id) {
    const clientInstructions: { slug: string; instructions: string; primary: boolean }[] = [
      {
        slug: 'claude-code',
        instructions: '/plugin marketplace add Dammyjay93/interface-design\n# Then: /plugin menu → select interface-design → restart\n# First-time: /interface-design:init',
        primary: true,
      },
      {
        slug: 'cursor',
        instructions: 'npx mdskills install Dammyjay93/interface-design',
        primary: false,
      },
      {
        slug: 'claude-desktop',
        instructions: 'Download SKILL.md from the listing page, then:\nSettings → Capabilities → Skills → Upload',
        primary: false,
      },
      {
        slug: 'windsurf',
        instructions: 'npx mdskills install Dammyjay93/interface-design',
        primary: false,
      },
    ];

    for (const ci of clientInstructions) {
      const { data: client } = await supabase.from('clients').select('id').eq('slug', ci.slug).single();
      if (client) {
        await supabase.from('listing_clients').upsert({
          skill_id: data.id,
          client_id: client.id,
          install_instructions: ci.instructions,
          is_primary: ci.primary,
        }, { onConflict: 'skill_id,client_id' });
        console.log(`  → ${ci.slug}`);
      }
    }
  }

  console.log('\n✅ Done! View at: /skills/interface-design');
}

main().catch(console.error);
