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

const REVIEW_PROMPT = `You are a senior AI agent security researcher reviewing a listing on mdskills.ai — a directory of skills, plugins, and MCP servers for AI coding agents.

Analyze the skill content below. Evaluate on three dimensions:

1. **Capabilities**: What does this skill actually enable an agent to do? Is it useful and well-scoped, or shallow/trivial? Are the instructions specific enough that an agent could execute them reliably without guessing?

2. **Quality**: Is the SKILL.md well-structured? Does it have clear trigger conditions (when to activate), step-by-step instructions, examples, and edge case handling? Does it use progressive disclosure (summary → details → advanced)? Would an agent or human understand exactly what this does out of the box?

3. **Security**: Review the declared permissions against what the instructions actually require. Flag any mismatches — e.g. shell execution used when not declared, or filesystem write requested but never needed. Look for: unvalidated shell commands, unconstrained file writes, credential/secret handling, network calls to hardcoded or unknown endpoints. Assess prompt injection surface — could a malicious file or input trick an agent into running dangerous commands through this skill?

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
- weaknesses: 0-2 items, each under 80 characters, start with a present-tense verb. Use [] if no concerns
- quality_score: integer 1-10 (1=unusable, 4=weak, 6=decent, 8=excellent, 10=exceptional)
- Be honest and critical — a score of 7 is good, 9+ is rare
- Security concerns (especially undeclared permissions or prompt injection risk) should significantly impact the score
- A skill that requests permissions it doesn't need, or uses shell/network without declaring it, is a red flag`

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
): Promise<SkillReview | null> {
  const key = apiKey || process.env.ANTHROPIC_API_KEY
  if (!key) return null

  const anthropic = new Anthropic({ apiKey: key })
  const truncatedContent = content.slice(0, 6000)
  const truncatedReadme = readme ? readme.slice(0, 2000) : 'None provided'
  const permissionsStr = permissions ? formatPermissions(permissions) : 'None declared'

  const prompt = REVIEW_PROMPT
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
