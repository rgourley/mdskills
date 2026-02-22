/**
 * Shared AI review generator for skills, plugins, and MCP servers.
 * Used by both the backfill script and import-time generation.
 */
import Anthropic from '@anthropic-ai/sdk'

export interface SkillReview {
  summary: string
  strengths: string[]
  weaknesses: string[]
  quality_score: number
}

/** Build a human-readable permissions string from boolean flags */
function formatPermissions(perms: {
  filesystemRead?: boolean
  filesystemWrite?: boolean
  shellExec?: boolean
  networkAccess?: boolean
  gitWrite?: boolean
}): string {
  const lines: string[] = []
  if (perms.filesystemRead) lines.push('- Filesystem Read: YES')
  if (perms.filesystemWrite) lines.push('- Filesystem Write: YES')
  if (perms.shellExec) lines.push('- Shell Execution: YES')
  if (perms.networkAccess) lines.push('- Network Access: YES')
  if (perms.gitWrite) lines.push('- Git Write: YES')
  return lines.length > 0 ? lines.join('\n') : 'None declared'
}

const REVIEW_PROMPT = `You are a senior AI agent skill reviewer for mdskills.ai — a directory of skills, plugins, and MCP servers for AI coding agents.

LISTING TYPE: <ARTIFACT_TYPE>

Your job is to evaluate the content below based on its type:
- **Skills/Rules**: Evaluate the SKILL.md (or equivalent agent instruction file). This is what an AI agent reads and executes. The README is supplementary context only.
- **MCP Servers**: Evaluate the tool descriptions, setup documentation, and API quality. MCP servers provide tools to agents — they don't need trigger conditions or step-by-step instructions like skills do. Judge them on: clear tool descriptions, useful capabilities, good setup docs, and appropriate security.
- **Plugins**: Evaluate the plugin's capabilities, configuration, and integration quality.

Evaluate on three dimensions:

1. **Capabilities** (most important): What does this listing enable an agent to do? Is it useful and well-scoped? For skills: are the instructions specific and actionable? For MCP servers: are the tools well-described and genuinely useful? For plugins: does the plugin integrate well and add real value?

2. **Quality**: Is the content well-structured and clear? For skills: trigger conditions, step-by-step instructions, examples. For MCP servers: clear setup, good tool descriptions, configuration examples. A concise listing that gets the job done is better than a verbose one that rambles.

3. **Security**: Do the declared permissions match what's actually needed? Flag over-scoped permissions. Look for unvalidated shell commands or prompt injection risks. Minimal, appropriate permissions are a strength.

IMPORTANT scoring guidance:
- Focus on whether this listing provides genuine value to an AI agent
- A skill with clear actionable instructions deserves 7+
- An MCP server with useful, well-documented tools deserves 7+
- Strong content with good examples/edge cases deserves 8+
- Not having a README is fine — the primary content is what matters
- Only penalize security issues that are genuine concerns, not theoretical
- Content may be truncated for length — NEVER mention truncation in your review. Do not say "appears truncated", "content is cut off", "missing sections due to truncation", or anything similar. Judge only the content you can see. This is a hard rule.

---

SKILL.md CONTENT:
<CONTENT>

README (if available):
<README>

DECLARED PERMISSIONS:
<PERMISSIONS>

---

Respond ONLY with valid JSON (no markdown fences, no explanation) matching this exact schema:

{
  "summary": "One sentence (40-150 chars) capturing overall quality and what stands out",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["concern 1"],
  "quality_score": 7
}

Rules:
- summary: single sentence, 40-150 characters, do not mention the skill name
- strengths: 1-3 items, each under 80 characters, start with a present-tense verb
- weaknesses: 1-2 items, each under 80 characters, start with a present-tense verb. Every listing has room for improvement — always identify at least one concern or limitation
- quality_score: integer 1-10 (1=no useful instructions, 4=vague/incomplete, 7=solid and actionable, 8=strong with good coverage, 9=excellent with examples and edge cases, 10=exceptional best-in-class)
- A well-written skill with clear actionable instructions should score 7-8
- A skill with comprehensive instructions, examples, edge case handling, and proper security should score 9+
- Security concerns (undeclared permissions, prompt injection risk) should lower the score
- A skill that requests permissions it doesn't need is a yellow flag, not a dealbreaker`

const ARTIFACT_TYPE_LABELS: Record<string, string> = {
  skill_pack: 'Skill',
  mcp_server: 'MCP Server',
  plugin: 'Plugin',
  ruleset: 'Rules/Ruleset',
  workflow_pack: 'Workflow',
  extension: 'Extension',
  template_bundle: 'Starter Kit',
  openapi_action: 'OpenAPI Action',
}

export async function generateSkillReview(
  content: string,
  readme: string | null,
  permissions?: {
    filesystemRead?: boolean
    filesystemWrite?: boolean
    shellExec?: boolean
    networkAccess?: boolean
    gitWrite?: boolean
  },
  apiKey?: string,
  artifactType?: string,
): Promise<SkillReview | null> {
  const key = apiKey || process.env.ANTHROPIC_API_KEY
  if (!key) return null

  const anthropic = new Anthropic({ apiKey: key })
  const truncatedContent = content.slice(0, 12000)
  const truncatedReadme = readme ? readme.slice(0, 2000) : 'None provided'
  const permissionsStr = permissions ? formatPermissions(permissions) : 'None declared'
  const typeLabel = ARTIFACT_TYPE_LABELS[artifactType ?? ''] ?? 'Skill'

  const prompt = REVIEW_PROMPT
    .replace('<ARTIFACT_TYPE>', typeLabel)
    .replace('<CONTENT>', truncatedContent)
    .replace('<README>', truncatedReadme)
    .replace('<PERMISSIONS>', permissionsStr)

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })

    let text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    // Strip markdown fences if present
    text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
    const parsed = JSON.parse(text) as SkillReview

    // Validate shape
    if (
      typeof parsed.summary !== 'string' || parsed.summary.length < 10 ||
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.weaknesses) ||
      typeof parsed.quality_score !== 'number' ||
      parsed.quality_score < 1 || parsed.quality_score > 10
    ) {
      return null
    }

    return parsed
  } catch (err) {
    console.error('  Review error:', err instanceof Error ? err.message : err)
    return null
  }
}
