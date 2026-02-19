/**
 * Delete all skills from the database.
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 * Run: npm run clear:skills  (or tsx scripts/clear-skills.ts)
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
  const { data, error } = await supabase
    .from('skills')
    .delete()
    .gte('created_at', '1970-01-01')
    .select('id');

  if (error) {
    console.error('Failed to delete skills:', error.message);
    process.exit(1);
  }

  const count = data?.length ?? 0;
  console.log(`Deleted ${count} skill(s) from the database.`);
}

main().catch(console.error);
