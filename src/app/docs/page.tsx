import Link from 'next/link'
import { BookOpen, Code, Download, GitCompare, Lightbulb, Puzzle, Server, FileText, ExternalLink, Bot, ScrollText, Zap, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Docs — AI Agent Skills, Plugins, MCP Servers & Rules',
  description: 'Everything you need to work with AI agent skills, plugins, MCP servers, and rules. Getting started guides, best practices, specs, and compatible agents.',
  alternates: { canonical: '/docs' },
  openGraph: {
    title: 'Docs — mdskills.ai',
    description: 'Everything you need to work with AI agent skills, plugins, MCP servers, and rules. Getting started, best practices, and specs.',
    url: '/docs',
  },
  keywords: ['AI agent docs', 'SKILL.md', 'AGENTS.md', 'CLAUDE.md', '.cursorrules', 'MCP servers', 'AI plugins', 'agent configuration'],
}

export default function DocsPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Intro */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-neutral-900">Documentation</h1>
          <p className="mt-3 text-lg text-neutral-600">
            mdskills.ai is a directory of skills, plugins, MCP servers, and rules for AI coding agents.
            Whether you&apos;re installing your first skill or building your own, this is where to start.
          </p>
        </div>

        {/* Getting Started */}
        <div className="mb-12 p-6 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold">Getting Started</h2>
          </div>
          <p className="text-neutral-300 text-sm mb-5">
            Install your first skill in under a minute. Works with Claude Code, Cursor, VS Code, Codex, Gemini CLI, and 20+ other agents.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <p className="text-sm font-medium">Browse and pick a skill</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Explore <Link href="/skills" className="text-blue-400 hover:text-blue-300">skills</Link>,{' '}
                  <Link href="/plugins" className="text-blue-400 hover:text-blue-300">plugins</Link>,{' '}
                  <Link href="/mcp-servers" className="text-blue-400 hover:text-blue-300">MCP servers</Link>, or{' '}
                  <Link href="/rules" className="text-blue-400 hover:text-blue-300">rules</Link>.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <p className="text-sm font-medium">Install with one command</p>
                <div className="mt-1.5 rounded-lg bg-white/10 px-3 py-2 font-mono text-xs text-neutral-200">
                  npx mdskills install owner/skill-name
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">3</span>
              <div>
                <p className="text-sm font-medium">Use it</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Your agent discovers the skill automatically. Just ask it to do something the skill teaches.
                </p>
              </div>
            </div>
          </div>
          <Link href="/docs/install-skills" className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
            Detailed install guide <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* What is mdskills.ai? */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">What is mdskills.ai?</h2>
          <p className="text-neutral-600 mb-3">
            AI agents like Claude Code, Cursor, and Codex are powerful out of the box — but they don&apos;t know
            your specific workflows, conventions, or domain. The AI agent ecosystem has converged on a set of
            open formats to bridge this gap:
          </p>
          <ul className="space-y-2 text-neutral-600 ml-1">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <span><strong>Skills</strong> (SKILL.md) — modular capabilities loaded on demand. &ldquo;How to generate release notes in our format.&rdquo;</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
              <span><strong>Plugins</strong> — full-featured extensions bundling skills, commands, hooks, and agents into one installable package.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              <span><strong>MCP Servers</strong> — external tools that let agents call APIs, query databases, and access services via the Model Context Protocol.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              <span><strong>Rules</strong> (CLAUDE.md, .cursorrules, AGENTS.md) — project-level constraints. &ldquo;Never commit .env files. Always run tests before pushing.&rdquo;</span>
            </li>
          </ul>
          <p className="text-neutral-600 mt-3">
            mdskills.ai indexes all of these so you can find, compare, and install them in one place.
          </p>
        </div>

        {/* The 3 Layers */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">The three-layer architecture</h2>
          <div className="space-y-4">
            {[
              {
                title: 'Rules',
                icon: FileText,
                color: 'bg-amber-50 text-amber-700',
                description: 'Project-wide constraints that apply to every task. Rules tell agents what to always (or never) do — coding conventions, safety constraints, testing requirements.',
                formats: ['CLAUDE.md', '.cursorrules', 'AGENTS.md', 'GEMINI.md', '.clinerules'],
                links: [
                  { label: 'Browse rules', href: '/rules', internal: true },
                  { label: 'AGENTS.md spec', href: '/specs/agents-md', internal: true },
                ],
              },
              {
                title: 'Skills & Plugins',
                icon: Puzzle,
                color: 'bg-blue-50 text-blue-700',
                description: 'Modular capabilities loaded on demand. Skills teach agents how to do specific tasks. Plugins bundle multiple skills with commands, hooks, and agents.',
                formats: ['SKILL.md', 'Plugins'],
                links: [
                  { label: 'What are skills?', href: '/docs/what-are-skills', internal: true },
                  { label: 'Browse skills', href: '/skills', internal: true },
                  { label: 'Browse plugins', href: '/plugins', internal: true },
                ],
              },
              {
                title: 'Tools & Servers',
                icon: Server,
                color: 'bg-green-50 text-green-700',
                description: 'External capabilities that let agents take action — call APIs, query databases, search the web. MCP is the standard for connecting agents to tools.',
                formats: ['MCP Servers', 'OpenAPI Actions'],
                links: [
                  { label: 'What is MCP?', href: '/docs/what-is-mcp', internal: true },
                  { label: 'Browse MCP servers', href: '/mcp-servers', internal: true },
                ],
              },
            ].map((layer) => {
              const Icon = layer.icon
              return (
                <div key={layer.title} className="p-5 rounded-xl border border-neutral-200 bg-white">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${layer.color} flex items-center justify-center`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-neutral-900">{layer.title}</h3>
                      <p className="mt-1 text-sm text-neutral-600">{layer.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {layer.formats.map((f) => (
                          <span key={f} className="px-2 py-0.5 rounded-md bg-neutral-100 text-xs font-mono text-neutral-700">
                            {f}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4">
                        {layer.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            {link.label} &rarr;
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Guides */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">Guides</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: BookOpen, title: 'What are Agent Skills?', desc: 'The SKILL.md format, progressive disclosure, and how agents discover skills.', href: '/docs/what-are-skills' },
              { icon: FileText, title: 'Create an Agent Skill', desc: 'Step-by-step guide to writing, validating, and publishing your first SKILL.md.', href: '/docs/create-a-skill' },
              { icon: Lightbulb, title: 'SKILL.md Best Practices', desc: 'Practical tips for writing skills that agents use well.', href: '/docs/skill-best-practices' },
              { icon: GitCompare, title: 'Skills vs MCP Servers', desc: 'When to write a skill and when to build an MCP server.', href: '/docs/skills-vs-mcp' },
              { icon: Download, title: 'How to Install Skills', desc: 'Where to put SKILL.md files for every major agent.', href: '/docs/install-skills' },
              { icon: Code, title: 'SKILL.md Examples', desc: 'Annotated walkthroughs of four skill patterns that work.', href: '/docs/skill-examples' },
              { icon: Server, title: 'What is MCP?', desc: 'The Model Context Protocol — connecting agents to external tools.', href: '/docs/what-is-mcp' },
              { icon: Bot, title: 'Compatible Agents', desc: '27+ AI agents that support SKILL.md, MCP, and more.', href: '/clients' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group block p-5 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4.5 h-4.5 text-neutral-500 group-hover:text-blue-600 transition-colors" />
                    <h3 className="font-semibold text-sm text-neutral-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-1.5 text-xs text-neutral-600">{item.desc}</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Specs & Standards */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <ScrollText className="w-5 h-5 text-neutral-600" />
            <h2 className="text-xl font-semibold text-neutral-900">Specs &amp; Standards</h2>
          </div>
          <p className="text-sm text-neutral-600 mb-4">
            Technical reference for the open formats powering the AI agent ecosystem.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'SKILL.md', href: '/specs/skill-md', desc: 'The agent skills format' },
              { label: 'AGENTS.md', href: '/specs/agents-md', desc: 'Project context for AI agents' },
              { label: 'MCP Protocol', href: '/specs/mcp', desc: 'Model Context Protocol' },
              { label: 'CLAUDE.md', href: '/specs/claude-md', desc: 'Project instructions for Claude' },
              { label: '.cursorrules', href: '/specs/cursorrules', desc: 'Custom rules for Cursor' },
              { label: 'llms.txt', href: '/specs/llms-txt', desc: 'Making websites AI-readable' },
              { label: 'SOUL.md', href: '/specs/soul-md', desc: 'Personal identity for AI agents' },
            ].map((spec) => (
              <Link
                key={spec.href}
                href={spec.href}
                className="group block p-4 rounded-lg border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md transition-all duration-200"
              >
                <h3 className="font-semibold font-mono text-sm text-neutral-900 group-hover:text-blue-600 transition-colors">
                  {spec.label}
                </h3>
                <p className="mt-1 text-xs text-neutral-500">{spec.desc}</p>
              </Link>
            ))}
          </div>
          <Link
            href="/specs"
            className="inline-block mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            All specs &amp; standards &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
