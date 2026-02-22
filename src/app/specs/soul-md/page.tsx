import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SOUL.md — Personal Identity for AI Agents',
  description: 'SOUL.md encodes your personality, voice, worldview, and opinions into a structured markdown file that AI agents read and embody. Created by Aaron Mars / OpenClaw.',
  alternates: { canonical: '/specs/soul-md' },
  openGraph: {
    title: 'SOUL.md — Personal Identity for AI Agents — mdskills.ai',
    description: 'SOUL.md encodes personality, voice, and worldview into a file AI agents can read and embody. Identity persistence without fine-tuning.',
    url: '/specs/soul-md',
  },
  keywords: ['SOUL.md', 'AI agent identity', 'AI personality', 'soul file', 'OpenClaw', 'AI voice', 'agent identity persistence'],
}

export default function SoulMdPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/specs" className="text-sm text-neutral-500 hover:text-neutral-700 mb-8 inline-block">
          &larr; Specs
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">
            SOUL.md — Personal Identity for AI Agents
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            SOUL.md is a markdown file that encodes your personality, voice, worldview, and opinions
            into a format AI agents can read and embody. Unlike project-level configs like CLAUDE.md
            or .cursorrules, SOUL.md defines <em>who the AI is</em> — not what it should do. Created by{' '}
            <a href="https://github.com/aaronjmars/soul.md" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Aaron Mars
            </a>{' '}
            and built into the OpenClaw ecosystem.
          </p>
        </div>

        <section className="prose-neutral">
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">What problem does it solve?</h2>
          <p className="text-neutral-600 mb-4">
            Every AI conversation starts from zero. System prompts get lost between sessions. Fine-tuning
            is expensive and requires massive datasets. SOUL.md solves this by distilling your identity — your
            real opinions, writing style, vocabulary, and worldview — into structured markdown that any LLM
            can read on the fly. The AI&apos;s outputs feel authentically continuous with your voice without
            any model training.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">How it differs from other formats</h2>
          <p className="text-neutral-600 mb-4">
            Most AI config files are <em>project-level instructions</em> — they tell an agent how to work
            within a specific codebase. SOUL.md is fundamentally different: it&apos;s a <em>personal identity file</em>
            that travels with the person, not the repo.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse my-4">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">Format</th>
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">Defines</th>
                  <th className="text-left py-2 font-semibold text-neutral-900">Travels with</th>
                </tr>
              </thead>
              <tbody className="text-neutral-600">
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">SOUL.md</td>
                  <td className="py-2 pr-4">Who the AI is — personality, voice, opinions</td>
                  <td className="py-2">The person</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">CLAUDE.md</td>
                  <td className="py-2 pr-4">Project rules and constraints</td>
                  <td className="py-2">The repo</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">.cursorrules</td>
                  <td className="py-2 pr-4">Coding conventions for Cursor</td>
                  <td className="py-2">The repo</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">AGENTS.md</td>
                  <td className="py-2 pr-4">Build steps, architecture, conventions</td>
                  <td className="py-2">The repo</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-neutral-900">SKILL.md</td>
                  <td className="py-2 pr-4">How to do a specific task</td>
                  <td className="py-2">The skill</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">File structure</h2>
          <p className="text-neutral-600 mb-4">
            A SOUL.md setup is a directory containing several files that work together:
          </p>

          <div className="rounded-xl bg-code-bg border border-neutral-200 text-neutral-800 p-6 font-mono text-sm my-6 overflow-x-auto">
            <div className="text-neutral-500">your-soul/</div>
            <div className="text-neutral-700">├── SOUL.md          <span className="text-neutral-400"># Identity core — who you are</span></div>
            <div className="text-neutral-700">├── STYLE.md         <span className="text-neutral-400"># Voice characteristics</span></div>
            <div className="text-neutral-700">├── SKILL.md         <span className="text-neutral-400"># Operating instructions for the agent</span></div>
            <div className="text-neutral-700">├── BUILD.md         <span className="text-neutral-400"># How to create this agent</span></div>
            <div className="text-neutral-700">├── data/            <span className="text-neutral-400"># Source material (tweets, essays, etc.)</span></div>
            <div className="text-neutral-700">└── examples/        <span className="text-neutral-400"># Calibration samples</span></div>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">What goes in SOUL.md</h2>
          <p className="text-neutral-600 mb-4">
            The core file is 30-80 lines of structured markdown. Every line should serve a purpose. Key sections:
          </p>

          <div className="rounded-xl bg-code-bg border border-neutral-200 text-neutral-800 p-6 font-mono text-sm my-6 overflow-x-auto">
            <div className="text-green-700"># Your Name</div>
            <div className="text-neutral-500 mt-1">One-line identity summary.</div>
            <div className="text-green-700 mt-3">## Who I Am</div>
            <div className="text-neutral-500">Background, context, what you do.</div>
            <div className="text-green-700 mt-3">## Worldview</div>
            <div className="text-neutral-500">Core beliefs — bulleted, specific, opinionated.</div>
            <div className="text-green-700 mt-3">## Opinions</div>
            <div className="text-neutral-500">Domain-specific takes on technology, industry, etc.</div>
            <div className="text-green-700 mt-3">## Interests</div>
            <div className="text-neutral-500">Areas of focus with depth and context.</div>
            <div className="text-green-700 mt-3">## Influences</div>
            <div className="text-neutral-500">People, books, concepts that shaped your thinking.</div>
            <div className="text-green-700 mt-3">## Vocabulary</div>
            <div className="text-neutral-500">Terms you use with your own definitions.</div>
            <div className="text-green-700 mt-3">## Tensions &amp; Contradictions</div>
            <div className="text-neutral-500">Unresolved beliefs — this is what makes it human.</div>
            <div className="text-green-700 mt-3">## Boundaries</div>
            <div className="text-neutral-500">&quot;Won&apos;t&quot; statements and areas of uncertainty.</div>
          </div>

          <p className="text-neutral-600 mb-4">
            The key principle is <strong>specificity over generality</strong>. Real opinions with reasoning,
            named influences instead of abstract references, and even contradictions that reflect genuine
            human inconsistency. &ldquo;Galaxy-brained cope&rdquo; beats &ldquo;nuanced views.&rdquo;
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">How to build one</h2>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 ml-2">
            <li><strong>Interview mode</strong> — use a <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">/soul-builder</code> command. The agent interviews you and generates your SOUL.md</li>
            <li><strong>Data analysis</strong> — feed your existing writing (tweets, essays, conversations) to an AI and let it distill the patterns</li>
            <li><strong>Manual</strong> — fill in the template sections yourself. The most intentional approach</li>
          </ul>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Who supports it</h2>
          <p className="text-neutral-600 mb-4">
            SOUL.md is natively supported by{' '}
            <a href="https://openclawsoul.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              OpenClaw
            </a>. Since it&apos;s plain markdown, any agent that reads files from the workspace can use it —
            Claude Code, ChatGPT, Cursor, and others. The format is agent-agnostic by design.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Related specs</h2>
          <ul className="space-y-1 text-neutral-600">
            <li><Link href="/specs/claude-md" className="text-blue-600 hover:underline">CLAUDE.md</Link> — project-level instructions for Claude Code</li>
            <li><Link href="/specs/agents-md" className="text-blue-600 hover:underline">AGENTS.md</Link> — project context for AI agents</li>
            <li><Link href="/specs/skill-md" className="text-blue-600 hover:underline">SKILL.md</Link> — modular capabilities loaded on demand</li>
          </ul>
        </section>

        <div className="mt-12 p-6 rounded-xl bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900">Official Repository</h3>
          <p className="mt-1 text-sm text-blue-800">
            SOUL.md is an open-source project created by Aaron Mars.
          </p>
          <a
            href="https://github.com/aaronjmars/soul.md"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            View on GitHub <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
