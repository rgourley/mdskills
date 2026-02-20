import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SKILL.md Examples',
  description: 'Annotated walkthroughs of well-written SKILL.md files. See what makes a great skill — descriptions, structure, progressive disclosure, and practical patterns.',
  alternates: { canonical: '/docs/skill-examples' },
  openGraph: {
    title: 'SKILL.md Examples — mdskills.ai',
    description: 'Annotated walkthroughs of well-written SKILL.md files. Learn from real skills that agents use well.',
    url: '/docs/skill-examples',
  },
  keywords: [
    'SKILL.md examples',
    'agent skill examples',
    'SKILL.md template',
    'skill examples',
    'how to write SKILL.md',
    'skill file format',
    'agent skills tutorial',
  ],
}

const EXAMPLES = [
  {
    title: 'A minimal skill that works',
    subtitle: 'The simplest useful skill you can write.',
    why: 'Sometimes all you need is 15 lines. This teaches an agent your team\'s commit message format. No scripts, no reference files, just clear instructions.',
    code: [
      { text: '---', color: 'text-neutral-400' },
      { text: 'name: commit-message', color: '' },
      { text: 'description: Generates conventional commit messages', color: '' },
      { text: '  following our team format. Use when committing', color: '' },
      { text: '  code or the user asks to create a commit.', color: '' },
      { text: '---', color: 'text-neutral-400' },
      { text: '', color: '' },
      { text: '# Commit Message Format', color: 'text-green-700' },
      { text: '', color: '' },
      { text: 'Use conventional commits with these types:', color: '' },
      { text: '- feat: new feature visible to users', color: '' },
      { text: '- fix: bug fix', color: '' },
      { text: '- refactor: code change that doesn\'t fix or add', color: '' },
      { text: '- docs: documentation only', color: '' },
      { text: '- test: adding or updating tests', color: '' },
      { text: '', color: '' },
      { text: 'Format: type(scope): lowercase summary under 72 chars', color: '' },
      { text: '', color: '' },
      { text: 'Include a body for non-obvious changes. Reference', color: '' },
      { text: 'issue numbers when applicable: "Closes #123"', color: '' },
    ],
    annotations: [
      'Description names the trigger ("when committing code"). This is how the agent knows to activate it.',
      'The instructions are short and specific. The agent already knows how to write commits \u2014 it just needs your format.',
      'No explanation of what a commit message is. The agent knows. Only adds what\u2019s unique to your team.',
    ],
  },
  {
    title: 'A skill with progressive disclosure',
    subtitle: 'Main file stays lean. Details live in reference files loaded on demand.',
    why: 'This pattern keeps the initial context cost low. The agent reads the overview on activation, then dips into reference files only when it actually needs the details.',
    code: [
      { text: '---', color: 'text-neutral-400' },
      { text: 'name: api-integration', color: '' },
      { text: 'description: Implements API integrations following', color: '' },
      { text: '  our patterns. Use when the user asks to connect', color: '' },
      { text: '  to a third-party API, add a new endpoint, or', color: '' },
      { text: '  integrate an external service.', color: '' },
      { text: '---', color: 'text-neutral-400' },
      { text: '', color: '' },
      { text: '# API Integration Guide', color: 'text-green-700' },
      { text: '', color: '' },
      { text: '## Workflow', color: 'text-green-700' },
      { text: '1. Check if a client already exists in src/clients/', color: '' },
      { text: '2. If not, create one following the template below', color: '' },
      { text: '3. Add error handling and retry logic', color: '' },
      { text: '4. Write integration tests', color: '' },
      { text: '5. Update the API docs in docs/apis.md', color: '' },
      { text: '', color: '' },
      { text: '## Resources', color: 'text-green-700' },
      { text: '- For client template: see reference/client-template.ts', color: '' },
      { text: '- For auth patterns: see reference/auth-patterns.md', color: '' },
      { text: '- For error codes: see reference/error-codes.md', color: '' },
    ],
    annotations: [
      'The main SKILL.md is a routing document. It gives the agent the workflow and tells it where to find details.',
      'Reference files aren\u2019t loaded until the agent actually needs them \u2014 zero context cost until accessed.',
      'Numbered workflow steps. Agents follow sequential instructions far more reliably than freeform paragraphs.',
    ],
  },
  {
    title: 'A skill with input/output examples',
    subtitle: 'Few-shot patterns work in skills too.',
    why: 'Showing the agent what you expect is often clearer than explaining it. This pattern is especially useful when the output format matters.',
    code: [
      { text: '---', color: 'text-neutral-400' },
      { text: 'name: release-notes', color: '' },
      { text: 'description: Generates release notes from git history.', color: '' },
      { text: '  Use when the user asks to write release notes,', color: '' },
      { text: '  create a changelog entry, or summarize a release.', color: '' },
      { text: '---', color: 'text-neutral-400' },
      { text: '', color: '' },
      { text: '# Release Notes Generator', color: 'text-green-700' },
      { text: '', color: '' },
      { text: '## Steps', color: 'text-green-700' },
      { text: '1. Run `git log --oneline` for the release range', color: '' },
      { text: '2. Group commits by type (features, fixes, etc.)', color: '' },
      { text: '3. Write user-facing summaries (not commit messages)', color: '' },
      { text: '', color: '' },
      { text: '## Example', color: 'text-green-700' },
      { text: '', color: '' },
      { text: '**Input** (git log):', color: '' },
      { text: 'abc123 feat: add dark mode toggle', color: 'text-neutral-500' },
      { text: 'def456 fix: correct date parsing in reports', color: 'text-neutral-500' },
      { text: 'ghi789 feat: export to CSV', color: 'text-neutral-500' },
      { text: '', color: '' },
      { text: '**Output**:', color: '' },
      { text: '## v2.4.0', color: 'text-neutral-500' },
      { text: '### New', color: 'text-neutral-500' },
      { text: '- Dark mode is now available in Settings > Appearance', color: 'text-neutral-500' },
      { text: '- Export any report to CSV from the download menu', color: 'text-neutral-500' },
      { text: '### Fixed', color: 'text-neutral-500' },
      { text: '- Dates in reports now display correctly across timezones', color: 'text-neutral-500' },
    ],
    annotations: [
      'The example shows the transformation clearly: raw git log in, polished user-facing notes out.',
      'Notice the output uses plain language ("Dark mode is now available"), not developer jargon ("feat: add dark mode toggle").',
      'One example is often enough. Two is better if the format is complex. More than three is usually overkill.',
    ],
  },
  {
    title: 'A skill with a feedback loop',
    subtitle: 'Validate, fix, repeat.',
    why: 'The most common quality improvement is adding a validation step. Without explicit instructions to loop, agents tend to validate once and move on regardless of the result.',
    code: [
      { text: '---', color: 'text-neutral-400' },
      { text: 'name: schema-migration', color: '' },
      { text: 'description: Creates database schema migrations.', color: '' },
      { text: '  Use when the user needs to modify database tables,', color: '' },
      { text: '  add columns, create indexes, or change schema.', color: '' },
      { text: 'disable-model-invocation: true', color: '' },
      { text: '---', color: 'text-neutral-400' },
      { text: '', color: '' },
      { text: '# Schema Migration', color: 'text-green-700' },
      { text: '', color: '' },
      { text: '## Steps', color: 'text-green-700' },
      { text: '1. Generate the migration file:', color: '' },
      { text: '   `npx prisma migrate dev --name $ARGUMENTS`', color: '' },
      { text: '2. Review the generated SQL', color: '' },
      { text: '3. Run validation:', color: '' },
      { text: '   `npx prisma validate`', color: '' },
      { text: '4. If validation fails, fix the schema and', color: '' },
      { text: '   **return to step 3**', color: '' },
      { text: '5. Only proceed when validation passes', color: '' },
      { text: '6. Run `npx prisma generate` to update the client', color: '' },
      { text: '7. Run existing tests to check for regressions', color: '' },
      { text: '', color: '' },
      { text: '## Important', color: 'text-green-700' },
      { text: 'Never modify migration files after they\'ve been', color: '' },
      { text: 'applied. Create a new migration instead.', color: '' },
    ],
    annotations: [
      'disable-model-invocation: true \u2014 you don\u2019t want the agent auto-triggering database migrations. Manual invoke only.',
      'Steps 3-4 create an explicit loop. "Return to step 3" is the key instruction most skill authors forget.',
      '$ARGUMENTS gets replaced with whatever follows the slash command: /schema-migration add-user-roles',
    ],
  },
]

export default function SkillExamplesPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link
          href="/docs"
          className="text-sm text-neutral-500 hover:text-neutral-700 mb-8 inline-block"
        >
          &larr; Docs
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">
            SKILL.md Examples
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            Four patterns that show up in well-written skills, with annotated walkthroughs of each.
            Steal these structures &mdash; they work.
          </p>
        </div>

        <section className="prose-neutral">

          {/* Examples */}
          <div className="space-y-12">
            {EXAMPLES.map((example, i) => (
              <div key={example.title}>
                <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-2">
                  {i + 1}. {example.title}
                </h2>
                <p className="text-sm text-neutral-500 mb-4">{example.subtitle}</p>
                <p className="text-neutral-600 mb-4">{example.why}</p>

                {/* Code block */}
                <div className="rounded-xl bg-code-bg border border-neutral-200 text-neutral-800 p-4 font-mono text-sm my-6 overflow-x-auto">
                  {example.code.map((line, j) => (
                    <div key={j} className={line.color || ''}>
                      {line.text || '\u00A0'}
                    </div>
                  ))}
                </div>

                {/* Annotations */}
                <div className="space-y-2">
                  {example.annotations.map((note, j) => (
                    <div key={j} className="flex items-start gap-3 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                        {j + 1}
                      </span>
                      <p className="text-neutral-600">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* What these have in common */}
          <div className="mt-12 p-6 rounded-xl bg-neutral-50 border border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">What these all have in common</h2>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li className="flex items-start gap-2">
                <span className="text-neutral-400 mt-0.5">&bull;</span>
                <span><strong>Specific descriptions with triggers.</strong> Every description says what the skill does <em>and</em> when to use it.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400 mt-0.5">&bull;</span>
                <span><strong>No unnecessary context.</strong> None of them explain concepts the agent already knows.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400 mt-0.5">&bull;</span>
                <span><strong>Numbered steps.</strong> Sequential instructions, not freeform paragraphs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400 mt-0.5">&bull;</span>
                <span><strong>Under 30 lines.</strong> You can read each one in 15 seconds. That&rsquo;s the point.</span>
              </li>
            </ul>
          </div>

          {/* Find more */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Find more examples</h2>
          <p className="text-neutral-600 mb-4">
            Browse real skills on mdskills.ai to see how the community structures them. The top-installed
            skills are a good starting point &mdash; they&rsquo;ve been tested by thousands of developers.
          </p>

          {/* Links */}
          <div className="mt-8 flex flex-wrap gap-6">
            <Link
              href="/skills"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Browse the marketplace &rarr;
            </Link>
            <a
              href="https://github.com/anthropics/skills"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Anthropic&rsquo;s Official Skills <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Link
              href="/docs/create-a-skill"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Create your own &rarr;
            </Link>
            <Link
              href="/docs/skill-best-practices"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Best practices &rarr;
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
