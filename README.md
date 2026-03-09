# mdskills.ai

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
[![CI](https://github.com/rgourley/mdskills/actions/workflows/ci.yml/badge.svg)](https://github.com/rgourley/mdskills/actions/workflows/ci.yml)

The open marketplace for AI agent skills. Browse, install, and share SKILL.md files for Claude Code, Cursor, VS Code Copilot, Codex, and Gemini CLI.

**Website:** [mdskills.ai](https://www.mdskills.ai)

## CLI

```bash
npx mdskills                          # Interactive mode
npx mdskills search "code review"     # Search skills
npx mdskills list                     # Browse popular skills
npx mdskills install anthropics/pdf   # Install a skill
npx mdskills init                     # Scaffold a new SKILL.md
```

### Commands

| Command | Description |
|---------|-------------|
| `mdskills` | Interactive mode with menus |
| `mdskills search <query>` | Search the marketplace |
| `mdskills list` | List popular skills |
| `mdskills categories` | List all categories |
| `mdskills info <slug>` | Show skill details |
| `mdskills install <slug>` | Install a skill |
| `mdskills init` | Scaffold a new SKILL.md |

### Options

```bash
mdskills list --category coding      # Filter by category
mdskills list --sort trending        # Sort: popular, trending, recent
mdskills list --type mcp_server      # Filter by type
mdskills list --featured             # Featured skills only
mdskills list --json                 # Machine-readable output
```

## Development Setup

```bash
git clone https://github.com/rgourley/mdskills.git
cd mdskills
npm install
cp .env.example .env                  # Add your Supabase credentials
npm run dev                           # Start dev server
```

### Project Structure

```
src/
  app/[locale]/     # Pages with locale-aware routing (next-intl)
  components/       # Shared React components
  i18n/             # Internationalization config
  lib/              # Utilities, DB queries, helpers
messages/           # Translation files (en, zh, fr, de, ko)
scripts/            # Data import and maintenance scripts
supabase/           # Database migrations
```

### Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL + Auth)
- **Styling:** Tailwind CSS
- **i18n:** next-intl (5 locales)
- **Payments:** Stripe
- **Hosting:** Vercel

## Internationalization

The site is available in 5 languages:

| Language | Prefix | Example |
|----------|--------|---------|
| English | (none) | `/skills` |
| Chinese | `/zh` | `/zh/skills` |
| French | `/fr` | `/fr/skills` |
| German | `/de` | `/de/skills` |
| Korean | `/ko` | `/ko/skills` |

Translation files are in `messages/`. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to help translate.

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**We pay for high-quality contributions** — especially translations and significant features. Open an issue labeled `bounty` to discuss.

### Quick Links

- [Report a Bug](https://github.com/rgourley/mdskills/issues/new?template=bug_report.yml)
- [Request a Feature](https://github.com/rgourley/mdskills/issues/new?template=feature_request.yml)
- [Help Translate](https://github.com/rgourley/mdskills/issues/new?template=translation.yml)
- [Security Policy](SECURITY.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

## Links

- Website: [mdskills.ai](https://www.mdskills.ai)
- Specs: [SKILL.md Specification](https://www.mdskills.ai/specs/skill-md)
- Docs: [mdskills.ai/docs](https://www.mdskills.ai/docs)

## License

[AGPL-3.0](LICENSE) — You can view, fork, and contribute freely. If you run a modified version as a service, you must open-source your changes.
