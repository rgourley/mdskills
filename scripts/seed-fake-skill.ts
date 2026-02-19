/**
 * Insert a single fake skill for layout/testing.
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 * Run: npm run seed:fake
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

const FAKE_SKILL = {
  slug: 'fake-layout-test',
  name: 'Fake Layout Test Skill',
  description: 'A sample skill used to test the skill detail page layout, download, copy, and npx command actions.',
  owner: 'mdskills-demo',
  repo: 'fake-skill-repo',
  skill_path: '.cursor/skills',
  github_url: 'https://github.com/mdskills-demo/fake-skill-repo',
  content: `# Fake Layout Test Skill

Use this skill to test the mdskills detail page.

## When to use
- Testing the skill detail layout
- Verifying Download, Copy command, and npx command actions
- Checking tabs (Overview, Source, Forks, Comments)

## Instructions
1. Download SKILL.md and place in your project.
2. Or copy the install command and run in terminal.
3. Or run: \`npx mdskills install mdskills-demo/fake-layout-test\`
`,
  status: 'published',
  featured: true,
  weekly_installs: 42,
  mdskills_upvotes: 7,
  mdskills_forks: 2,
  tags: ['testing', 'demo', 'cursor'],
  platforms: ['cursor', 'claude', 'codex'],
};

async function main() {
  const { data, error } = await supabase
    .from('skills')
    .upsert(FAKE_SKILL, { onConflict: 'slug' })
    .select('id, slug, name')
    .single();

  if (error) {
    console.error('Insert failed:', error.message);
    process.exit(1);
  }
  console.log('✓ Fake skill added:', data?.name, `(slug: ${data?.slug})`);
  console.log('  View at: /skills/fake-layout-test');
}

main();
