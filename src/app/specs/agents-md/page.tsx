import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AGENTS.md — Project Context for AI Agents',
  description: 'AGENTS.md gives AI coding agents project-level context about your codebase, build steps, conventions, and testing workflows. Now a Linux Foundation standard with 60,000+ repos.',
  alternates: { canonical: '/specs/agents-md' },
  openGraph: {
    title: 'AGENTS.md — Project Context for AI Agents — mdskills.ai',
    description: 'Project-level context for AI agents. Build steps, conventions, testing workflows. Linux Foundation standard with 60,000+ repos.',
    url: '/specs/agents-md',
  },
  keywords: ['AGENTS.md', 'AGENTS.md format', 'agents md file', 'AI agent context', 'project instructions AI', 'Linux Foundation'],
}

export default function AgentsMdPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/specs" className="text-sm text-neutral-500 hover:text-neutral-700 mb-8 inline-block">
          &larr; Specs
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">
            AGENTS.md — Project Context for AI Agents
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            AGENTS.md is a markdown file placed at the root of a repository that gives AI coding agents
            essential context about the project — how to build it, test it, and follow its conventions.
            Originally created by the community, it is now a{' '}
            <a href="https://agents.md" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Linux Foundation standard
            </a>{' '}
            with adoption across 60,000+ repositories.
          </p>
        </div>

        <section className="prose-neutral">
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">What problem does it solve?</h2>
          <p className="text-neutral-600 mb-4">
            When an AI agent opens your project for the first time, it doesn&rsquo;t know your build system,
            testing framework, or code style. Without guidance, it guesses — and often gets things wrong.
            AGENTS.md provides that missing context in a format every agent can read. It answers
            &ldquo;how does this project work?&rdquo; so the agent can start contributing immediately.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">How it works</h2>
          <p className="text-neutral-600 mb-4">
            Place an <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">AGENTS.md</code> file
            at your repository root. AI agents read it on every interaction, treating it as always-on project context.
          </p>

          <div className="rounded-xl bg-code-bg border border-neutral-200 text-neutral-800 p-6 font-mono text-sm my-6 overflow-x-auto">
            <div className="text-green-700"># AGENTS.md</div>
            <div className="mt-3 text-green-700">## Build</div>
            <div className="text-neutral-700">- Run `npm install` to install dependencies</div>
            <div className="text-neutral-700">- Run `npm run build` to compile TypeScript</div>
            <div className="text-neutral-700">- Run `npm run dev` for development server on port 3000</div>
            <div className="mt-3 text-green-700">## Test</div>
            <div className="text-neutral-700">- Run `npm test` for unit tests (Jest)</div>
            <div className="text-neutral-700">- Run `npm run test:e2e` for end-to-end tests (Playwright)</div>
            <div className="text-neutral-700">- Always run tests before committing</div>
            <div className="mt-3 text-green-700">## Code Style</div>
            <div className="text-neutral-700">- TypeScript strict mode, no `any` types</div>
            <div className="text-neutral-700">- Use named exports, not default exports</div>
            <div className="text-neutral-700">- Follow existing patterns in the codebase</div>
            <div className="mt-3 text-green-700">## Architecture</div>
            <div className="text-neutral-700">- Next.js App Router with server components</div>
            <div className="text-neutral-700">- Supabase for database and auth</div>
            <div className="text-neutral-700">- Tailwind CSS for styling</div>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">What to include</h2>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 ml-2">
            <li><strong>Build commands</strong> — how to install dependencies and start the project</li>
            <li><strong>Testing</strong> — how to run tests, what framework you use</li>
            <li><strong>Code style</strong> — naming conventions, patterns to follow or avoid</li>
            <li><strong>Architecture</strong> — key frameworks, folder structure, important decisions</li>
            <li><strong>Deployment</strong> — how and where the project deploys</li>
          </ul>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">AGENTS.md vs SKILL.md vs CLAUDE.md</h2>
          <p className="text-neutral-600 mb-4">
            These three formats serve different purposes:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse my-4">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">Format</th>
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">Scope</th>
                  <th className="text-left py-2 font-semibold text-neutral-900">Loaded</th>
                </tr>
              </thead>
              <tbody className="text-neutral-600">
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">AGENTS.md</td>
                  <td className="py-2 pr-4">Project context — build, test, conventions</td>
                  <td className="py-2">Every prompt</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">SKILL.md</td>
                  <td className="py-2 pr-4">Specific task capabilities</td>
                  <td className="py-2">On demand</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-neutral-900">CLAUDE.md</td>
                  <td className="py-2 pr-4">Claude-specific project rules</td>
                  <td className="py-2">Every prompt (Claude only)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Who supports it</h2>
          <p className="text-neutral-600 mb-4">
            AGENTS.md is recognized by Claude Code, Codex, Gemini CLI, Cursor, GitHub Copilot, and most
            modern AI coding agents. Because it uses standard markdown with no special syntax, any agent that
            reads project files can benefit from it.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Related specs</h2>
          <ul className="space-y-1 text-neutral-600">
            <li><Link href="/specs/skill-md" className="text-blue-600 hover:underline">SKILL.md</Link> — for modular, on-demand capabilities</li>
            <li><Link href="/specs/claude-md" className="text-blue-600 hover:underline">CLAUDE.md</Link> — Claude-specific project instructions</li>
            <li><Link href="/specs/cursorrules" className="text-blue-600 hover:underline">.cursorrules</Link> — Cursor-specific project rules</li>
          </ul>
        </section>

        <div className="mt-12 p-6 rounded-xl bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900">Official Specification</h3>
          <p className="mt-1 text-sm text-blue-800">
            The AGENTS.md standard is maintained by the Linux Foundation.
          </p>
          <a
            href="https://agents.md"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            Read the specification at agents.md <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
