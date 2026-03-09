# Contributing to mdskills.ai

Thanks for your interest in contributing! mdskills.ai is the open marketplace for AI agent skills, and we welcome contributions of all kinds.

## Ways to Contribute

### Report Bugs
Found something broken? [Open a bug report](https://github.com/rgourley/mdskills/issues/new?template=bug_report.yml) with steps to reproduce.

### Request Features
Have an idea? [Open a feature request](https://github.com/rgourley/mdskills/issues/new?template=feature_request.yml) and describe what you'd like to see.

### Help Translate
We support 5 languages (English, Chinese, French, German, Korean) and always need help improving translations. Translation files live in `messages/`:

```
messages/
  en.json   # English (source of truth)
  zh.json   # Chinese
  fr.json   # French
  de.json   # German
  ko.json   # Korean
```

To improve a translation:
1. Compare the target language file against `en.json`
2. Fix any awkward or incorrect translations
3. Submit a PR with your changes

Want to add a new language? Open an issue first so we can coordinate.

### Fix Bugs & Build Features
1. Fork the repo
2. Create a feature branch: `git checkout -b my-feature`
3. Make your changes
4. Run the build to verify: `npm run build`
5. Commit with a clear message
6. Open a PR against `main`

## Paid Contributions

We pay for high-quality contributions! If you're interested in tackling a larger feature or doing substantial translation work, reach out by opening an issue labeled `bounty` or email the maintainer. We'll agree on scope and compensation before you start.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/rgourley/mdskills.git
cd mdskills

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your Supabase credentials (or run with mock data)

# Start dev server
npm run dev
```

## Project Structure

```
src/
  app/[locale]/     # All pages (locale-aware routing via next-intl)
  components/       # Shared React components
  i18n/             # Internationalization config
  lib/              # Utilities, DB queries, helpers
messages/           # Translation JSON files (one per locale)
scripts/            # Data import and maintenance scripts
supabase/           # Database migrations
```

## Code Style

- TypeScript throughout
- Tailwind CSS for styling
- Server components by default, client components only when needed
- Use `getTranslations()` in server components, `useTranslations()` in client components
- Use `import { Link } from '@/i18n/navigation'` instead of `next/link`

## Translation Guidelines

- Keep translation keys in English (camelCase)
- Use ICU message format for plurals: `"{count, plural, one {# skill} other {# skills}}"`
- Escape literal curly braces with single quotes: `"path: .'{agent}'/skills/"` 
- Don't translate code examples, CLI commands, or brand names (SKILL.md, MCP, etc.)
- Keep translations natural — don't translate word-for-word

## Pull Request Process

1. Ensure `npm run build` passes with no errors
2. Describe what your PR does and why
3. Link any related issues
4. PRs require one review before merging

## License

By contributing, you agree that your contributions will be licensed under the [AGPL-3.0](LICENSE) license.
