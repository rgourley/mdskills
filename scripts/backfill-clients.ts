/**
 * Backfill listing_clients for existing skills.
 * Skills with markdown-based formats should be linked to all markdown-consuming clients.
 * MCP servers should be linked to all MCP-capable clients.
 *
 * Usage:
 *   npx tsx scripts/backfill-clients.ts          # dry run
 *   npx tsx scripts/backfill-clients.ts --apply   # actually write to DB
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key)
const apply = process.argv.includes('--apply')

// Same lists as import-skill.ts
const MARKDOWN_CLIENTS = [
  'claude-code', 'claude-desktop', 'cursor', 'vscode-copilot', 'windsurf',
  'continue-dev', 'codex', 'gemini-cli', 'amp', 'roo-code', 'goose',
  'opencode', 'trae', 'qodo', 'command-code',
]

const MCP_CLIENTS = [
  'claude-code', 'claude-desktop', 'cursor', 'vscode-copilot', 'windsurf',
  'continue-dev', 'gemini-cli', 'amp', 'roo-code', 'goose',
]

const FORMAT_SPECIFIC_CLIENTS: Record<string, string[]> = {
  cursorrules: ['cursor'],
  mdc: ['cursor'],
  claude_md: ['claude-code', 'claude-desktop'],
  copilot_instructions: ['vscode-copilot', 'github'],
  gemini_md: ['gemini', 'gemini-cli'],
  windsurf_rules: ['windsurf'],
  clinerules: ['roo-code'],
}

function getClientsForSkill(artifactType: string, formatStandard: string): string[] {
  if (formatStandard && FORMAT_SPECIFIC_CLIENTS[formatStandard]) {
    return FORMAT_SPECIFIC_CLIENTS[formatStandard]
  }
  if (artifactType === 'mcp_server') return MCP_CLIENTS
  return MARKDOWN_CLIENTS
}

async function main() {
  console.log(apply ? '🔧 APPLY MODE — will update database' : '👀 DRY RUN — pass --apply to write changes')
  console.log('')

  // Fetch all clients
  const { data: allClients } = await supabase.from('clients').select('id, slug')
  if (!allClients) {
    console.error('Failed to fetch clients')
    process.exit(1)
  }
  const clientMap = new Map(allClients.map(c => [c.slug, c.id]))

  // Fetch all published skills
  const { data: skills, error } = await supabase
    .from('skills')
    .select('id, slug, name, owner, repo, artifact_type, format_standard')
    .or('status.eq.published,status.is.null')

  if (error || !skills) {
    console.error('Failed to fetch skills:', error?.message)
    process.exit(1)
  }

  console.log(`Processing ${skills.length} skills...\n`)

  let totalAdded = 0

  for (const skill of skills) {
    const targetClients = getClientsForSkill(skill.artifact_type || 'skill_pack', skill.format_standard || 'skill_md')

    // Check existing links
    const { data: existing } = await supabase
      .from('listing_clients')
      .select('client_id')
      .eq('skill_id', skill.id)

    const existingClientIds = new Set((existing || []).map(e => e.client_id))
    const newClients: string[] = []

    for (const clientSlug of targetClients) {
      const clientId = clientMap.get(clientSlug)
      if (clientId && !existingClientIds.has(clientId)) {
        newClients.push(clientSlug)
      }
    }

    if (newClients.length > 0) {
      console.log(`  ${skill.slug.padEnd(35)} +${newClients.length} clients: ${newClients.join(', ')}`)

      if (apply) {
        for (const clientSlug of newClients) {
          const clientId = clientMap.get(clientSlug)
          if (!clientId) continue

          let instructions: string
          if (skill.artifact_type === 'mcp_server') {
            const npmPkg = skill.repo
            if (clientSlug === 'claude-code') {
              instructions = `claude mcp add ${skill.slug} -- npx -y ${npmPkg}`
            } else if (clientSlug === 'cursor') {
              instructions = `Add to .cursor/mcp.json:\n{"mcpServers":{"${skill.slug}":{"command":"npx","args":["-y","${npmPkg}"]}}}`
            } else {
              instructions = `npx -y ${npmPkg}`
            }
          } else {
            instructions = `npx mdskills install ${skill.owner}/${skill.slug}`
          }

          await supabase.from('listing_clients').upsert(
            { skill_id: skill.id, client_id: clientId, install_instructions: instructions, is_primary: clientSlug === 'claude-code' },
            { onConflict: 'skill_id,client_id' }
          )
        }
      }

      totalAdded += newClients.length
    }
  }

  console.log(`\n${apply ? '✅ Added' : '📋 Would add'}: ${totalAdded} client links`)
  if (!apply && totalAdded > 0) {
    console.log('\nRun with --apply to write changes:')
    console.log('  npx tsx scripts/backfill-clients.ts --apply')
  }
}

main().catch(console.error)
