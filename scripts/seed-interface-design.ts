/**
 * Seed the interface-design plugin skill (Design & Frontend, Claude Code plugin).
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

async function main() {
  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'design-frontend')
    .single();

  const categoryId = cat?.id ?? null;

  const skill = {
    slug: 'interface-design',
    name: 'Interface Design',
    description:
      'Design systems with persistent memory for professional, consistent UIs. Build dashboards, apps, and tools with intention.',
    owner: 'Dammyjay93',
    repo: 'interface-design',
    skill_path: '.claude',
    github_url: 'https://github.com/Dammyjay93/interface-design',
    status: 'published',
    featured: true,
    skill_type: 'hybrid',
    has_plugin: true,
    has_examples: true,
    difficulty: 'beginner',
    category_id: categoryId,
    author_username: 'Dammyjay93',
    weekly_installs: 1600,
    mdskills_upvotes: 0,
    mdskills_forks: 0,
    github_stars: 1600,
    github_forks: 136,
    license: 'MIT',
    artifact_type: 'skill_pack',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: false,
    perm_network_access: false,
    perm_git_write: false,
    tags: ['design-systems', 'ui-design', 'frontend', 'professional-design', 'consistency', 'dashboards'],
    platforms: ['claude-code', 'claude-web', 'claude-desktop', 'cursor', 'windsurf', 'codex'],
    content: `# Interface Design

Design systems with persistent memory for professional, consistent UIs.

## Quick Start (Claude Code)

\`\`\`bash
/plugin marketplace add Dammyjay93/interface-design
/plugin menu
# Select interface-design, restart

/interface-design:init
\`\`\`

**Get full features:**
- Persistent \`.interface-design/system.md\`
- Cross-session memory
- Commands: \`/status\`, \`/audit\`, \`/extract\`

## Basic Install (Other Platforms)

\`\`\`bash
npx mdskills install Dammyjay93/interface-design
\`\`\`

## What this skill does

Creates persistent design systems for building consistent, professional interfaces.

**With interface-design:**
- System loads automatically each session (Claude Code)
- Patterns reused (Button: 36px, Card: 16px padding)
- Spacing stays on grid (4px, 8px, 12px, 16px)
- Consistent depth and surface treatment

## Commands (Claude Code only)

- \`/interface-design:init\` — Start with design principles
- \`/interface-design:status\` — Show current system
- \`/interface-design:audit\` — Check code against system
- \`/interface-design:extract\` — Extract patterns from code
`,
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
  console.log('✓ Plugin skill added:', data?.name, `(slug: ${data?.slug})`);

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
        console.log(`  ✓ Linked to ${ci.slug}`);
      }
    }
  }

  console.log('  View at: /skills/interface-design');
  console.log('  Plugins list: /skills?plugin=1');
}

main();
