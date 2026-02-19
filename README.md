# mdskills

Find, browse, and install AI agent skills from the command line.

```
npx mdskills
```

## Quick Start

```bash
# Interactive mode
npx mdskills

# Search for skills
npx mdskills search "code review"

# Browse popular skills
npx mdskills list

# Get skill details
npx mdskills info memory-mcp-1file

# Install a skill
npx mdskills install anthropics/pdf
```

## Commands

| Command | Description |
|---------|-------------|
| `mdskills` | Interactive mode with menus |
| `mdskills search <query>` | Search the marketplace |
| `mdskills list` | List popular skills |
| `mdskills categories` | List all categories |
| `mdskills info <slug>` | Show skill details |
| `mdskills install <slug>` | Install a skill |
| `mdskills init` | Scaffold a new SKILL.md |

## List Options

```bash
mdskills list --category coding      # Filter by category
mdskills list --sort trending        # Sort: popular, trending, recent
mdskills list --type mcp_server      # Filter by type
mdskills list --featured             # Featured skills only
mdskills list --limit 10             # Limit results
```

## Install

Skills are installed to format-appropriate locations:

| Type | Location |
|------|----------|
| Skill packs | `.claude/skills/<slug>/SKILL.md` |
| Rulesets | Format-specific (`.cursorrules`, `CLAUDE.md`, etc.) |
| MCP servers | Prints install commands per platform |

```bash
mdskills install anthropics/pdf          # Interactive confirmation
mdskills install anthropics/pdf -y       # Skip confirmation
```

## Scripting

All read commands support `--json` for machine-readable output:

```bash
mdskills search pdf --json
mdskills list --json | jq '.skills[].name'
mdskills info memory-mcp-1file --json
mdskills categories --json
```

Disable colors with `--no-color` or the `NO_COLOR` environment variable.

## Create a Skill

```bash
mdskills init
```

This scaffolds a `SKILL.md` file with frontmatter and sections. Learn more about the format at [mdskills.ai/specs/skill-md](https://www.mdskills.ai/specs/skill-md).

## Links

- Website: [mdskills.ai](https://www.mdskills.ai)
- Specs: [mdskills.ai/specs](https://www.mdskills.ai/specs)
- Issues: [github.com/rgourley/mdskills/issues](https://github.com/rgourley/mdskills/issues)

## License

MIT
