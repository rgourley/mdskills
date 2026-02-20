/**
 * Backfill categories for existing skills that have category_id = null.
 * Uses the same keyword-scoring logic as the import script.
 *
 * Usage:
 *   npx tsx scripts/backfill-categories.ts              # dry run (null categories only)
 *   npx tsx scripts/backfill-categories.ts --apply       # write to DB (null categories only)
 *   npx tsx scripts/backfill-categories.ts --reset-all   # dry run (clear + re-detect for all batch-imported)
 *   npx tsx scripts/backfill-categories.ts --reset-all --apply  # write to DB
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)
const apply = process.argv.includes('--apply')
const resetAll = process.argv.includes('--reset-all')

// ── Category keyword map (same as import-skill.ts) ──────────────

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'code-review': ['code review', 'lint', 'linting', 'eslint', 'prettier', 'code quality', 'static analysis', 'code style'],
  'documentation': ['documentation', 'docs', 'readme', 'jsdoc', 'typedoc', 'api docs', 'docstring'],
  'testing': ['testing', 'test', 'jest', 'mocha', 'pytest', 'unit test', 'e2e', 'qa', 'quality assurance', 'playwright', 'cypress', 'vitest'],
  'security': ['security', 'vulnerability', 'cve', 'owasp', 'pentest', 'penetration test', 'encryption', 'exploit', 'malware', 'firewall'],
  'api-development': ['api', 'rest', 'graphql', 'openapi', 'swagger', 'endpoint', 'webhook', 'grpc'],
  'data-analysis': ['data analysis', 'data science', 'analytics', 'visualization', 'pandas', 'jupyter', 'notebook', 'csv', 'dataset'],
  'productivity': ['productivity', 'automation', 'workflow', 'task', 'todo', 'scheduling', 'time tracking', 'cli tool', 'memory', 'note'],
  'creative': ['creative', 'writing', 'content', 'copywriting', 'blog', 'storytelling', 'image', 'art'],
  'design-systems': ['design system', 'ui', 'component', 'tailwind', 'css', 'react component', 'figma', 'storybook', 'frontend'],
  'information-architecture': ['information architecture', 'navigation', 'sitemap', 'taxonomy', 'content structure'],
  'resume-writing': ['resume', 'cv', 'cover letter', 'career', 'job', 'hiring', 'interview'],
  'devops-ci-cd': ['devops', 'ci/cd', 'docker', 'kubernetes', 'terraform', 'github actions', 'deployment', 'infrastructure', 'pipeline', 'aws', 'gcp', 'azure'],
  'database-design': ['database', 'sql', 'postgres', 'mysql', 'mongodb', 'schema', 'migration', 'orm', 'prisma', 'supabase'],
  'content-creation': ['content creation', 'blog post', 'marketing', 'seo', 'social media', 'newsletter', 'copywriting'],
  'research-analysis': ['research', 'analysis', 'literature review', 'synthesis', 'survey', 'paper', 'academic'],
  'code-generation': ['code generation', 'scaffolding', 'boilerplate', 'generator', 'template', 'starter', 'cli', 'scaffold'],
}

function detectCategory(name: string, description: string, tags: string[], readme: string | null): string | null {
  const text = [
    name.replace(/[-_]/g, ' '),
    description,
    ...tags,
    (readme || '').slice(0, 800),
  ].join(' ').toLowerCase()

  let bestCategory: string | null = null
  let bestScore = 0

  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0
    for (const kw of keywords) {
      if (text.includes(kw)) {
        // Tags get a stronger signal
        score += tags.some(t => t.toLowerCase().includes(kw)) ? 3 : 1
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestCategory = slug
    }
  }

  return bestScore >= 2 ? bestCategory : null
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  console.log(apply ? '🔧 APPLY MODE — will update database' : '👀 DRY RUN — pass --apply to write changes')
  if (resetAll) console.log('🔄 RESET-ALL MODE — will clear and re-detect categories for ALL skills')
  console.log('')

  // Fetch all categories
  const { data: cats } = await supabase.from('categories').select('id, slug, name')
  if (!cats) {
    console.error('Failed to fetch categories')
    process.exit(1)
  }
  const catMap = new Map(cats.map(c => [c.slug, c.id]))

  // If --reset-all, clear category_id for all batch-imported skills first
  if (resetAll && apply) {
    console.log('Clearing category_id for all batch-imported skills (owner = sickn33)...')
    const { count, error: resetError } = await supabase
      .from('skills')
      .update({ category_id: null }, { count: 'exact' })
      .eq('owner', 'sickn33')
    if (resetError) {
      console.error('Failed to reset categories:', resetError.message)
      process.exit(1)
    }
    console.log(`  Cleared ${count} skills\n`)
  }

  // Fetch skills to process
  let query = supabase
    .from('skills')
    .select('id, slug, name, description, tags, readme, category_id')
    .or('status.eq.published,status.is.null')

  if (resetAll) {
    // Re-detect for ALL skills from this owner (after clearing)
    query = query.eq('owner', 'sickn33')
  } else {
    // Default: only skills with no category
    query = query.is('category_id', null)
  }

  const { data: skills, error } = await query

  if (error) {
    console.error('Failed to fetch skills:', error.message)
    process.exit(1)
  }

  if (!skills || skills.length === 0) {
    console.log('✅ All skills already have categories assigned!')
    return
  }

  console.log(`Found ${skills.length} skills without a category\n`)

  let assigned = 0
  let skipped = 0

  for (const skill of skills) {
    const detected = detectCategory(
      skill.name || '',
      skill.description || '',
      skill.tags || [],
      skill.readme || null,
    )

    if (detected) {
      const categoryId = catMap.get(detected)
      if (categoryId) {
        console.log(`  ✓ ${skill.slug.padEnd(35)} → ${detected}`)
        if (apply) {
          await supabase.from('skills').update({ category_id: categoryId }).eq('id', skill.id)
        }
        assigned++
      } else {
        console.log(`  ⚠ ${skill.slug.padEnd(35)} → ${detected} (category not in DB)`)
        skipped++
      }
    } else {
      console.log(`  - ${skill.slug.padEnd(35)} → (no match)`)
      skipped++
    }
  }

  console.log(`\n${apply ? '✅ Updated' : '📋 Would update'}: ${assigned} skills`)
  if (skipped > 0) {
    console.log(`⏭  Skipped: ${skipped} skills (no confident match)`)
  }
  if (!apply && assigned > 0) {
    console.log('\nRun with --apply to write changes:')
    console.log('  npx tsx scripts/backfill-categories.ts --apply')
  }
}

main().catch(console.error)
