/**
 * Backfill listing_clients for existing skills based on their platforms array.
 * Maps platform names to client slugs and creates generic install instructions.
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 * Run: npm run seed:clients
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

/** Map platform names (from skills.platforms array) to client slugs */
const PLATFORM_TO_CLIENT: Record<string, string> = {
  'claude': 'claude-code',
  'claude-code': 'claude-code',
  'claude-web': 'claude-desktop',
  'claude-desktop': 'claude-desktop',
  'cursor': 'cursor',
  'codex': 'codex',
  'windsurf': 'windsurf',
  'chatgpt': 'chatgpt',
  'gemini': 'gemini',
  'vscode': 'vscode-copilot',
  'continue': 'continue-dev',
  'replit': 'replit',
  'grok': 'grok',
};

async function main() {
  console.log('🔗 Backfilling listing_clients...\n');

  // Fetch all clients
  const { data: clients } = await supabase.from('clients').select('id, slug');
  if (!clients?.length) {
    console.error('No clients found. Run the migration first.');
    process.exit(1);
  }
  const clientMap = new Map(clients.map((c) => [c.slug, c.id]));

  // Fetch all skills
  const { data: skills } = await supabase.from('skills').select('id, slug, owner, platforms');
  if (!skills?.length) {
    console.log('No skills found. Nothing to backfill.');
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const skill of skills) {
    const platforms: string[] = skill.platforms ?? [];
    if (platforms.length === 0) continue;

    const clientSlugs = new Set<string>();
    for (const platform of platforms) {
      const mapped = PLATFORM_TO_CLIENT[platform.toLowerCase()];
      if (mapped && clientMap.has(mapped)) {
        clientSlugs.add(mapped);
      }
    }

    // Always ensure claude-code is included (it's the primary client)
    if (clientMap.has('claude-code')) {
      clientSlugs.add('claude-code');
    }

    for (const clientSlug of Array.from(clientSlugs)) {
      const clientId = clientMap.get(clientSlug);
      if (!clientId) continue;

      const installInstructions = `npx mdskills install ${skill.owner}/${skill.slug}`;
      const { error } = await supabase.from('listing_clients').upsert({
        skill_id: skill.id,
        client_id: clientId,
        install_instructions: installInstructions,
        is_primary: clientSlug === 'claude-code',
      }, { onConflict: 'skill_id,client_id' });

      if (error) {
        console.log(`  ⚠ ${skill.slug} → ${clientSlug}: ${error.message}`);
        skipped++;
      } else {
        created++;
      }
    }

    console.log(`  ✓ ${skill.slug} → ${Array.from(clientSlugs).join(', ')}`);
  }

  console.log(`\n✅ Backfill complete!`);
  console.log(`  Created/updated: ${created}`);
  console.log(`  Skipped: ${skipped}`);
}

main().catch(console.error);
