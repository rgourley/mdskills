import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '.cursorrules — Custom Rules for Cursor',
  description: 'The .cursorrules file lets you configure how Cursor writes code for your project. Set coding standards, naming conventions, preferred patterns, and project-specific instructions.',
  alternates: { canonical: '/specs/cursorrules' },
  openGraph: {
    title: '.cursorrules — Custom Rules for Cursor — mdskills.ai',
    description: 'Configure how Cursor writes code for your project. Set coding standards, naming conventions, and project-specific instructions.',
    url: '/specs/cursorrules',
  },
  keywords: ['.cursorrules', 'cursorrules', 'cursor rules file', 'cursor rules format', 'cursor AI rules', 'cursor project config'],
}

export default function CursorrulesPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/specs" className="text-sm text-neutral-500 hover:text-neutral-700 mb-8 inline-block">
          &larr; Specs
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">
            .cursorrules — Custom Rules for Cursor
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            The <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">.cursorrules</code> file
            is a project-level configuration that tells{' '}
            <a href="https://cursor.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Cursor
            </a>{' '}
            how to write code for your specific codebase. It&rsquo;s loaded into every AI interaction,
            giving Cursor persistent context about your project&rsquo;s conventions and preferences.
          </p>
        </div>

        <section className="prose-neutral">
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">What problem does it solve?</h2>
          <p className="text-neutral-600 mb-4">
            Every project has its own coding style — naming conventions, framework preferences, architectural
            patterns, and rules. Without explicit guidance, AI assistants default to generic patterns that may
            not match your codebase. A .cursorrules file ensures Cursor follows your project&rsquo;s standards
            on every interaction.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">How it works</h2>
          <p className="text-neutral-600 mb-4">
            Place a <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">.cursorrules</code> file
            at your project root. Cursor reads it automatically and applies the rules to all AI-generated code.
            The file is plain text with natural language instructions.
          </p>

          <div className="rounded-xl bg-neutral-900 text-white p-6 font-mono text-sm my-6 overflow-x-auto">
            <div className="text-neutral-400"># .cursorrules</div>
            <div className="mt-2 text-neutral-300">You are an expert in TypeScript, React, Next.js</div>
            <div className="text-neutral-300">App Router, and Tailwind CSS.</div>
            <div className="mt-3 text-neutral-300">Key conventions:</div>
            <div className="text-neutral-300">- Use functional components with TypeScript interfaces</div>
            <div className="text-neutral-300">- Prefer server components; use &apos;use client&apos; only when needed</div>
            <div className="text-neutral-300">- Use Tailwind for all styling, no CSS modules</div>
            <div className="text-neutral-300">- Name components in PascalCase, utilities in camelCase</div>
            <div className="text-neutral-300">- Always handle loading and error states</div>
            <div className="text-neutral-300">- Write concise, readable code — no over-engineering</div>
            <div className="mt-3 text-neutral-300">Project structure:</div>
            <div className="text-neutral-300">- src/app/ for routes (Next.js App Router)</div>
            <div className="text-neutral-300">- src/components/ for shared UI components</div>
            <div className="text-neutral-300">- src/lib/ for utilities and data fetching</div>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Cursor also supports .mdc rules</h2>
          <p className="text-neutral-600 mb-4">
            In addition to the global <code className="px-1 py-0.5 bg-neutral-100 rounded text-xs">.cursorrules</code> file,
            Cursor supports <code className="px-1 py-0.5 bg-neutral-100 rounded text-xs">.cursor/rules/*.mdc</code> files
            for more granular, file-pattern-specific rules. Each .mdc file can target specific file types or directories
            and includes frontmatter for metadata.
          </p>

          <div className="rounded-xl bg-neutral-900 text-white p-6 font-mono text-sm my-6 overflow-x-auto">
            <div className="text-neutral-400"># .cursor/rules/react-components.mdc</div>
            <div className="text-neutral-400">---</div>
            <div><span className="text-blue-400">description</span>: Rules for React components</div>
            <div><span className="text-blue-400">globs</span>: src/components/**/*.tsx</div>
            <div className="text-neutral-400">---</div>
            <div className="mt-2 text-neutral-300">All components must:</div>
            <div className="text-neutral-300">- Export a named function (not default)</div>
            <div className="text-neutral-300">- Accept props via a TypeScript interface</div>
            <div className="text-neutral-300">- Include JSDoc with a one-line description</div>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Tips for effective rules</h2>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 ml-2">
            <li>Be specific — &ldquo;use Tailwind&rdquo; is better than &ldquo;use good styling&rdquo;</li>
            <li>Include your tech stack explicitly</li>
            <li>Describe your project structure so the agent knows where to put files</li>
            <li>Add error handling and testing preferences</li>
            <li>Keep it under 2000 tokens — it&rsquo;s loaded on every prompt</li>
          </ul>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Similar formats in other tools</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse my-4">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">Tool</th>
                  <th className="text-left py-2 font-semibold text-neutral-900">Rules file</th>
                </tr>
              </thead>
              <tbody className="text-neutral-600">
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4">Cursor</td>
                  <td className="py-2 font-mono text-xs">.cursorrules</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4">Claude Code</td>
                  <td className="py-2 font-mono text-xs">CLAUDE.md</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4">Windsurf</td>
                  <td className="py-2 font-mono text-xs">.windsurf/rules</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4">Cline</td>
                  <td className="py-2 font-mono text-xs">.clinerules</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">GitHub Copilot</td>
                  <td className="py-2 font-mono text-xs">.github/copilot-instructions.md</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Related specs</h2>
          <ul className="space-y-1 text-neutral-600">
            <li><Link href="/specs/claude-md" className="text-blue-600 hover:underline">CLAUDE.md</Link> — Claude Code&rsquo;s equivalent project rules file</li>
            <li><Link href="/specs/agents-md" className="text-blue-600 hover:underline">AGENTS.md</Link> — cross-platform project context</li>
            <li><Link href="/specs/skill-md" className="text-blue-600 hover:underline">SKILL.md</Link> — for on-demand capabilities (not always-on rules)</li>
          </ul>
        </section>

        <div className="mt-12 p-6 rounded-xl bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900">Cursor Documentation</h3>
          <p className="mt-1 text-sm text-blue-800">
            Learn more about .cursorrules and rules configuration in the Cursor docs.
          </p>
          <a
            href="https://docs.cursor.com/context/rules-for-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            Read the Cursor rules documentation <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
