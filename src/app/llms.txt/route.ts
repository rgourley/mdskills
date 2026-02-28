import { NextResponse } from 'next/server'

const SITE = 'https://www.mdskills.ai'

const BODY = `# mdskills.ai

> The community marketplace for AI agent skills, MCP servers, rules, plugins, and tools. Browse 1500+ skills for Claude Code, Cursor, Codex, and 27+ AI coding agents.

## Docs
- [What are Skills](${SITE}/docs/what-are-skills): The SKILL.md format and how AI agents consume skills
- [Create a Skill](${SITE}/docs/create-a-skill): Step-by-step guide to authoring your first skill
- [Best Practices](${SITE}/docs/skill-best-practices): Writing effective, well-structured agent skills
- [Skills vs MCP](${SITE}/docs/skills-vs-mcp): When to use skills vs MCP servers
- [Install Skills](${SITE}/docs/install-skills): How to install skills in Claude Code, Cursor, and other clients
- [Skill Examples](${SITE}/docs/skill-examples): Annotated real-world skill examples

## Specifications
- [SKILL.md](${SITE}/specs/skill-md): The agent skills format — structured markdown that teaches AI agents specific capabilities
- [AGENTS.md](${SITE}/specs/agents-md): Project-level AI agent instructions and context
- [MCP Protocol](${SITE}/specs/mcp): Model Context Protocol for tool integration
- [CLAUDE.md](${SITE}/specs/claude-md): Claude Code project instructions format
- [.cursorrules](${SITE}/specs/cursorrules): Cursor editor custom rules format
- [SOUL.md](${SITE}/specs/soul-md): AI personality and behavior definition format
- [llms.txt](${SITE}/specs/llms-txt): Making websites AI-readable (this format)

## Marketplace
- [Skills](${SITE}/skills): Agent skills (SKILL.md, AGENTS.md, CLAUDE.md)
- [MCP Servers](${SITE}/mcp-servers): Model Context Protocol servers
- [Rules](${SITE}/rules): Editor rules (.cursorrules, .windsurfrules)
- [Plugins](${SITE}/plugins): Claude Code plugins
- [Tools](${SITE}/tools): Standalone developer tools
- [Use Cases](${SITE}/use-cases): Skills organized by use case category

## API
- [GET /api/skills](${SITE}/api/skills): Search and browse skills (JSON). Params: q, category, artifact_type (skill_pack|mcp_server|ruleset|plugin|tool), sort (popular|recent|trending), limit (max 50)
- [GET /api/skills/{slug}](${SITE}/api/skills/example-slug): Full skill detail with content, README, permissions, and install instructions
- [GET /api/categories](${SITE}/api/categories): List all categories with slug, name, description

## Optional
- [llms-full.txt](${SITE}/llms-full.txt): Expanded version with every skill listed by category
`

export async function GET() {
  return new NextResponse(BODY, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
