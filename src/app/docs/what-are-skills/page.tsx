import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'What are Agent Skills?',
  description: 'Learn about Agent Skills — the open SKILL.md format for extending AI agent capabilities. Understand progressive disclosure, frontmatter fields, and how 27+ agents use skills.',
  alternates: { canonical: '/docs/what-are-skills' },
  openGraph: {
    title: 'What are Agent Skills? — mdskills.ai',
    description: 'The open SKILL.md format for extending AI agent capabilities. Progressive disclosure, frontmatter fields, and how 27+ agents discover and use skills.',
    url: '/docs/what-are-skills',
  },
  keywords: ['SKILL.md', 'agent skills', 'what are skills', 'AI skills format', 'progressive disclosure', 'agentskills.io'],
}

export default function WhatAreSkillsPage() {
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
            What are Agent Skills?
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            Agent Skills are a lightweight, open format for extending AI agent capabilities with specialized
            knowledge and workflows. The format is standardized at{' '}
            <a href="https://agentskills.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              agentskills.io
            </a>
            {' '}and supported by 27+ AI agents.
          </p>
        </div>

        {/* Core concept */}
        <section className="prose-neutral">
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">The SKILL.md Format</h2>
          <p className="text-neutral-600 mb-4">
            At its core, a skill is a folder containing a <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">SKILL.md</code> file.
            This file includes metadata (name and description, at minimum) and instructions that tell an agent how to perform a specific task.
            Skills can also bundle scripts, templates, and reference materials.
          </p>

          {/* Directory structure */}
          <div className="rounded-xl bg-neutral-900 text-white p-6 font-mono text-sm my-6">
            <div className="text-neutral-400 mb-2"># Skill folder structure</div>
            <div>my-skill/</div>
            <div className="text-green-400">{'\u251C\u2500\u2500'} SKILL.md          # Required: instructions + metadata</div>
            <div className="text-neutral-400">{'\u251C\u2500\u2500'} scripts/          # Optional: executable code</div>
            <div className="text-neutral-400">{'\u251C\u2500\u2500'} references/       # Optional: documentation</div>
            <div className="text-neutral-400">{'\u2514\u2500\u2500'} assets/           # Optional: templates, resources</div>
          </div>

          {/* Frontmatter */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Frontmatter Fields</h2>
          <p className="text-neutral-600 mb-4">
            Every SKILL.md file starts with YAML frontmatter. Two fields are required; the rest are optional.
          </p>

          <div className="rounded-xl bg-neutral-900 text-white p-6 font-mono text-sm my-6 overflow-x-auto">
            <div className="text-neutral-400">---</div>
            <div><span className="text-blue-400">name</span>: pdf-processing</div>
            <div><span className="text-blue-400">description</span>: Extract text and tables from PDF files,</div>
            <div>  fill forms, merge documents.</div>
            <div><span className="text-neutral-500">license</span>: Apache-2.0</div>
            <div><span className="text-neutral-500">compatibility</span>: Requires pdfplumber, network access</div>
            <div><span className="text-neutral-500">metadata</span>:</div>
            <div>  <span className="text-neutral-500">author</span>: example-org</div>
            <div>  <span className="text-neutral-500">version</span>: &quot;1.0&quot;</div>
            <div><span className="text-neutral-500">allowed-tools</span>: Bash(python:*) Read Write</div>
            <div className="text-neutral-400">---</div>
          </div>

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
                  <td className="py-2">Max 64 chars. Lowercase letters, numbers, hyphens.</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-mono text-xs">description</td>
                  <td className="py-2 pr-4">Yes</td>
                  <td className="py-2">Max 1024 chars. What the skill does and when to use it.</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-mono text-xs">license</td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2">License name or reference to a bundled license file.</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-mono text-xs">compatibility</td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2">Environment requirements: intended product, packages, network access.</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-mono text-xs">metadata</td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2">Arbitrary key-value pairs for additional properties.</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">allowed-tools</td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2">Space-delimited list of pre-approved tools. Experimental.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Progressive Disclosure */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Progressive Disclosure</h2>
          <p className="text-neutral-600 mb-4">
            Skills are designed for efficient context management. Agents don&rsquo;t load everything at once:
          </p>

          <div className="space-y-4 my-6">
            {[
              { step: '1', title: 'Discovery', desc: 'At startup, agents load only the name and description of each available skill (~100 tokens). Just enough to know when a skill might be relevant.', tokens: '~100 tokens' },
              { step: '2', title: 'Activation', desc: 'When a task matches a skill\'s description, the agent reads the full SKILL.md instructions into context.', tokens: '<5000 tokens' },
              { step: '3', title: 'Execution', desc: 'The agent follows instructions, loading referenced files or executing bundled scripts only as needed.', tokens: 'As needed' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4 p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600">{item.desc}</p>
                  <span className="mt-1 inline-block text-xs text-neutral-400">{item.tokens}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Skills vs Rules vs AGENTS.md */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Skills vs Rules vs AGENTS.md</h2>
          <p className="text-neutral-600 mb-4">
            These three are often confused. Here&rsquo;s the distinction:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse my-6">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">Concept</th>
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">Purpose</th>
                  <th className="text-left py-2 font-semibold text-neutral-900">Loaded</th>
                </tr>
              </thead>
              <tbody className="text-neutral-600">
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">Rules</td>
                  <td className="py-2 pr-4">&ldquo;Always do this&rdquo; — universal project constraints</td>
                  <td className="py-2">Every prompt</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">AGENTS.md</td>
                  <td className="py-2 pr-4">&ldquo;How this project works&rdquo; — build steps, conventions</td>
                  <td className="py-2">Every prompt</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-neutral-900">Skills</td>
                  <td className="py-2 pr-4">&ldquo;How to do this task&rdquo; — modular capabilities</td>
                  <td className="py-2">On demand</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-neutral-600">
            The key test: <em>Would you want this applied to every single task?</em> If yes, it&rsquo;s a rule.
            If no, it&rsquo;s a skill. &ldquo;Never commit .env files&rdquo; is a rule. &ldquo;How to generate release
            notes in our format&rdquo; is a skill.
          </p>

          {/* Adoption */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Adoption</h2>
          <p className="text-neutral-600 mb-4">
            The Agent Skills format was originally developed by Anthropic, released as an open standard, and
            adopted by a growing ecosystem of AI development tools. Compatible agents include Claude Code,
            Cursor, OpenAI Codex, Gemini CLI, VS Code, GitHub Copilot, Amp, Roo Code, Goose, and many more.
          </p>

          {/* Links */}
          <div className="mt-10 flex flex-wrap gap-6">
            <a
              href="https://agentskills.io/specification"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Full Specification <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://github.com/anthropics/skills"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Example Skills <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Link
              href="/docs/create-a-skill"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Create your own &rarr;
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
