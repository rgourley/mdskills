import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CLAUDE.md — Project Instructions for Claude',
  description: 'CLAUDE.md is a markdown file that gives Claude Code persistent project context — coding standards, build commands, architectural decisions, and workflow preferences.',
  alternates: { canonical: '/specs/claude-md' },
  openGraph: {
    title: 'CLAUDE.md — Project Instructions for Claude — mdskills.ai',
    description: 'Give Claude Code persistent project context. Coding standards, build commands, architecture decisions, workflow preferences.',
    url: '/specs/claude-md',
  },
  keywords: ['CLAUDE.md', 'CLAUDE.md format', 'claude md file', 'Claude Code config', 'Claude project instructions', 'Anthropic Claude Code'],
}

export default function ClaudeMdPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/specs" className="text-sm text-neutral-500 hover:text-neutral-700 mb-8 inline-block">
          &larr; Specs
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">
            CLAUDE.md — Project Instructions for Claude
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            CLAUDE.md is a markdown file that gives{' '}
            <a href="https://docs.anthropic.com/en/docs/claude-code" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Claude Code
            </a>{' '}
            persistent context about your project. It&rsquo;s read automatically on every interaction,
            giving Claude knowledge about your codebase&rsquo;s conventions, architecture,
            and workflow preferences without you having to repeat instructions.
          </p>
        </div>

        <section className="prose-neutral">
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">What problem does it solve?</h2>
          <p className="text-neutral-600 mb-4">
            Every time you start a new Claude Code session, the agent doesn&rsquo;t remember your
            project&rsquo;s build system, testing conventions, or coding style. CLAUDE.md solves this
            by providing always-on instructions — &ldquo;this project uses pnpm, not npm&rdquo;, &ldquo;always
            run tests before committing&rdquo;, &ldquo;we use server components by default&rdquo;. Once
            written, you never have to repeat these instructions again.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">How it works</h2>
          <p className="text-neutral-600 mb-4">
            Place a <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">CLAUDE.md</code> file
            at your project root. Claude Code reads it automatically at the start of every conversation.
            You can also have a personal <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">~/.claude/CLAUDE.md</code> for
            global preferences that apply across all projects.
          </p>

          <div className="rounded-xl bg-neutral-900 text-white p-6 font-mono text-sm my-6 overflow-x-auto">
            <div className="text-green-400"># CLAUDE.md</div>
            <div className="mt-3 text-green-400">## Project</div>
            <div className="text-neutral-300">Next.js 14 App Router + Supabase + Tailwind CSS.</div>
            <div className="text-neutral-300">TypeScript strict mode. No `any` types.</div>
            <div className="mt-3 text-green-400">## Commands</div>
            <div className="text-neutral-300">- `npm run dev` — development server (port 3002)</div>
            <div className="text-neutral-300">- `npm run build` — production build</div>
            <div className="text-neutral-300">- `npm test` — run tests</div>
            <div className="mt-3 text-green-400">## Code Style</div>
            <div className="text-neutral-300">- Prefer server components; mark &apos;use client&apos; explicitly</div>
            <div className="text-neutral-300">- Use Lucide for icons, not emoji</div>
            <div className="text-neutral-300">- Keep components small and focused</div>
            <div className="text-neutral-300">- Use `@/` path alias for imports</div>
            <div className="mt-3 text-green-400">## Don&apos;t</div>
            <div className="text-neutral-300">- Don&apos;t add README files unless asked</div>
            <div className="text-neutral-300">- Don&apos;t commit .env files</div>
            <div className="text-neutral-300">- Don&apos;t use default exports</div>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">CLAUDE.md locations</h2>
          <p className="text-neutral-600 mb-4">
            Claude Code looks for CLAUDE.md in multiple locations, with more specific files taking precedence:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse my-4">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">Location</th>
                  <th className="text-left py-2 font-semibold text-neutral-900">Scope</th>
                </tr>
              </thead>
              <tbody className="text-neutral-600">
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-mono text-xs">~/.claude/CLAUDE.md</td>
                  <td className="py-2">Global — applies to all projects</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-mono text-xs">./CLAUDE.md</td>
                  <td className="py-2">Project root — applies to the current project</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">./src/CLAUDE.md</td>
                  <td className="py-2">Subdirectory — applies when working in that directory</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Tips for effective CLAUDE.md</h2>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 ml-2">
            <li>Keep it concise — it&rsquo;s loaded every prompt, so long files waste context</li>
            <li>Focus on what&rsquo;s <em>unique</em> to your project, not general knowledge</li>
            <li>Include build/test commands so Claude can verify its work</li>
            <li>List explicit &ldquo;don&rsquo;t&rdquo; rules to prevent common mistakes</li>
            <li>Update it as your project evolves</li>
          </ul>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">CLAUDE.md vs SKILL.md</h2>
          <p className="text-neutral-600 mb-4">
            CLAUDE.md is for <strong>always-on project context</strong> — rules that apply to every task
            (&ldquo;use TypeScript strict mode&rdquo;, &ldquo;run tests before committing&rdquo;). SKILL.md is for{' '}
            <strong>on-demand capabilities</strong> — instructions loaded only when relevant
            (&ldquo;how to generate PDFs&rdquo;, &ldquo;how to build a design system&rdquo;).
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Related specs</h2>
          <ul className="space-y-1 text-neutral-600">
            <li><Link href="/specs/cursorrules" className="text-blue-600 hover:underline">.cursorrules</Link> — Cursor&rsquo;s equivalent project rules format</li>
            <li><Link href="/specs/agents-md" className="text-blue-600 hover:underline">AGENTS.md</Link> — cross-platform project context (Linux Foundation)</li>
            <li><Link href="/specs/skill-md" className="text-blue-600 hover:underline">SKILL.md</Link> — for modular, on-demand capabilities</li>
          </ul>
        </section>

        <div className="mt-12 p-6 rounded-xl bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900">Official Documentation</h3>
          <p className="mt-1 text-sm text-blue-800">
            Learn more about CLAUDE.md in the Anthropic documentation.
          </p>
          <a
            href="https://docs.anthropic.com/en/docs/claude-code/memory"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            Read the Claude Code docs <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
