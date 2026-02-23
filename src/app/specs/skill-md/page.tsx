import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SKILL.md: The Agent Skills Format',
  description: 'SKILL.md is the open standard for creating modular, reusable capabilities for AI coding agents. Learn the format, frontmatter fields, and how 27+ agents discover and use skills.',
  alternates: { canonical: '/specs/skill-md' },
  openGraph: {
    title: 'SKILL.md: The Agent Skills Format | mdskills.ai',
    description: 'The open standard for creating modular, reusable capabilities for AI coding agents. Supported by Claude Code, Cursor, Codex, and 27+ agents.',
    url: '/specs/skill-md',
  },
  keywords: ['SKILL.md', 'SKILL.md spec', 'agent skills format', 'SKILL.md specification', 'agentskills.io', 'AI agent skills'],
}

export default function SkillMdPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/specs" className="text-sm text-neutral-500 hover:text-neutral-700 mb-8 inline-block">
          &larr; Specs
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">
            SKILL.md — The Agent Skills Format
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            SKILL.md is an open standard for packaging reusable capabilities that AI coding agents can
            discover and activate on demand. Created by Anthropic and standardized at{' '}
            <a href="https://agentskills.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              agentskills.io
            </a>
            , the format is supported by 27+ AI agents including Claude Code, Cursor, Codex, Gemini CLI, and VS Code.
          </p>
        </div>

        <section className="prose-neutral">
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">What problem does it solve?</h2>
          <p className="text-neutral-600 mb-4">
            Without skills, you repeat the same complex prompts every time you want an agent to do something specific —
            generate a PDF, build a design system, write Playwright tests. SKILL.md packages those instructions once so any
            compatible agent can pick them up automatically. Skills are loaded on demand, so they don&rsquo;t bloat your
            agent&rsquo;s context window.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">How it works</h2>
          <p className="text-neutral-600 mb-4">
            A skill is a folder containing a <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">SKILL.md</code> file
            with YAML frontmatter and markdown instructions. At minimum, a skill needs a name and description.
          </p>

          <div className="rounded-xl bg-code-bg border border-neutral-200 text-neutral-800 p-6 font-mono text-sm my-6 overflow-x-auto">
            <div className="text-neutral-400">---</div>
            <div><span className="text-blue-600">name</span>: pdf-processing</div>
            <div><span className="text-blue-600">description</span>: Extract text and tables from PDF files,</div>
            <div>  merge documents, fill forms, and convert to images.</div>
            <div><span className="text-neutral-500">license</span>: MIT</div>
            <div><span className="text-neutral-500">compatibility</span>:</div>
            <div>  - Claude Code</div>
            <div>  - Cursor</div>
            <div><span className="text-neutral-500">allowed-tools</span>: Bash(python:*) Read Write</div>
            <div className="text-neutral-400">---</div>
            <div className="mt-3 text-green-700"># PDF Processing</div>
            <div className="mt-1 text-neutral-700">When the user asks you to work with PDF files, follow</div>
            <div className="text-neutral-700">these instructions...</div>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Frontmatter fields</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse my-6">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">Field</th>
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">Required</th>
                  <th className="text-left py-2 font-semibold text-neutral-900">Description</th>
                </tr>
              </thead>
              <tbody className="text-neutral-600">
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-mono text-xs">name</td>
                  <td className="py-2 pr-4">Yes</td>
                  <td className="py-2">Unique identifier. Max 64 chars, lowercase letters, numbers, hyphens.</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-mono text-xs">description</td>
                  <td className="py-2 pr-4">Yes</td>
                  <td className="py-2">What the skill does and when to activate it. Max 1024 chars.</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-mono text-xs">license</td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2">SPDX license identifier or reference to a license file.</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-mono text-xs">compatibility</td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2">List of compatible agents and environment requirements.</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-mono text-xs">metadata</td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2">Arbitrary key-value pairs (author, version, tags).</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">allowed-tools</td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2">Space-delimited list of pre-approved tools for the agent.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Progressive disclosure</h2>
          <p className="text-neutral-600 mb-4">
            Skills use a three-phase loading model to keep context windows efficient:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-neutral-600 ml-2">
            <li><strong>Discovery</strong> — Agent reads only the name and description (~100 tokens)</li>
            <li><strong>Activation</strong> — When a task matches, the full SKILL.md is loaded (&lt;5000 tokens)</li>
            <li><strong>Execution</strong> — Agent follows instructions, loading referenced files as needed</li>
          </ol>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Who supports it</h2>
          <p className="text-neutral-600 mb-4">
            The SKILL.md format is supported by Claude Code, Cursor, OpenAI Codex, Gemini CLI, VS Code,
            GitHub Copilot, Amp, Roo Code, Goose, Windsurf, Continue, and many more. The full list of
            compatible agents is maintained at{' '}
            <a href="https://agentskills.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              agentskills.io
            </a>.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Related specs</h2>
          <ul className="space-y-1 text-neutral-600">
            <li><Link href="/specs/agents-md" className="text-blue-600 hover:underline">AGENTS.md</Link> — project-level context (loaded every prompt, not on demand)</li>
            <li><Link href="/specs/claude-md" className="text-blue-600 hover:underline">CLAUDE.md</Link> — Claude-specific project rules</li>
            <li><Link href="/specs/mcp" className="text-blue-600 hover:underline">MCP</Link> — for connecting agents to external tools and services</li>
          </ul>
        </section>

        <div className="mt-12 p-6 rounded-xl bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900">Official Specification</h3>
          <p className="mt-1 text-sm text-blue-800">
            The full SKILL.md specification is maintained at agentskills.io.
          </p>
          <a
            href="https://agentskills.io/specification"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            Read the full specification <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
