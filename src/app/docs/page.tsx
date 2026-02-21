import Link from 'next/link'
import { BookOpen, Code, Download, GitCompare, Lightbulb, Puzzle, Server, FileText, ExternalLink, Bot, ScrollText } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Docs: AI Agent Ecosystem',
  description: 'Understand the AI agent ecosystem: rules (CLAUDE.md, AGENTS.md, .cursorrules), skills (SKILL.md), tools (MCP servers), specs, and compatible agents. Learn how they work together.',
  alternates: { canonical: '/docs' },
  openGraph: {
    title: 'AI Agent Ecosystem Guide — mdskills.ai',
    description: 'Understand the AI agent ecosystem: rules, skills, and tools. Learn how SKILL.md, AGENTS.md, MCP servers, and more extend AI agent capabilities.',
    url: '/docs',
  },
  keywords: ['AI agent ecosystem', 'SKILL.md', 'AGENTS.md', 'CLAUDE.md', '.cursorrules', 'MCP servers', 'AI tools', 'agent configuration'],
}

const LAYERS = [
  {
    title: 'Rules',
    icon: FileText,
    color: 'bg-amber-50 text-amber-700',
    description: 'Project-wide constraints that apply to every task. Rules tell agents what to always (or never) do — coding conventions, safety constraints, testing requirements.',
    formats: ['CLAUDE.md', '.cursorrules', 'AGENTS.md', 'GEMINI.md', '.clinerules', 'copilot-instructions.md'],
    note: 'AGENTS.md is now an open standard under the Linux Foundation, used by 60,000+ repositories.',
    links: [
      { label: 'AGENTS.md', href: 'https://agents.md' },
    ],
  },
  {
    title: 'Skills',
    icon: Puzzle,
    color: 'bg-blue-50 text-blue-700',
    description: 'Modular capabilities that agents load on demand. Skills package procedural knowledge — how to generate release notes, process PDFs, design interfaces — into reusable SKILL.md files.',
    formats: ['SKILL.md'],
    note: 'The Agent Skills format (agentskills.io) is supported by 27+ AI agents including Claude Code, Cursor, Codex, Gemini CLI, and VS Code.',
    links: [
      { label: 'agentskills.io', href: 'https://agentskills.io' },
      { label: 'What are Skills?', href: '/docs/what-are-skills', internal: true },
      { label: 'Best Practices', href: '/docs/skill-best-practices', internal: true },
      { label: 'Skills vs MCP', href: '/docs/skills-vs-mcp', internal: true },
    ],
  },
  {
    title: 'Tools & Servers',
    icon: Server,
    color: 'bg-green-50 text-green-700',
    description: 'External capabilities that let agents take action — call APIs, query databases, search the web. MCP (Model Context Protocol) is the emerging standard for connecting agents to tools.',
    formats: ['MCP Servers', 'OpenAPI Actions', 'IDE Extensions'],
    note: 'MCP provides a standardized way for agents to discover and use tools, similar to how USB standardized hardware peripherals.',
    links: [
      { label: 'What is MCP?', href: '/docs/what-is-mcp', internal: true },
      { label: 'MCP Protocol', href: 'https://modelcontextprotocol.io' },
    ],
  },
]

export default function DocsPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">
            Understanding the AI Agent Ecosystem
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            AI agents are configured through three distinct layers. Understanding them helps you find the right tool — and build the right thing.
          </p>
        </div>

        {/* The 3 Layers */}
        <div className="space-y-6">
          {LAYERS.map((layer) => {
            const Icon = layer.icon
            return (
              <div key={layer.title} className="p-6 rounded-xl border border-neutral-200 bg-white">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${layer.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-neutral-900">{layer.title}</h2>
                    <p className="mt-2 text-neutral-600">{layer.description}</p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {layer.formats.map((f) => (
                        <span key={f} className="px-2 py-0.5 rounded-md bg-neutral-100 text-xs font-mono text-neutral-700">
                          {f}
                        </span>
                      ))}
                    </div>

                    <p className="mt-3 text-sm text-neutral-500">{layer.note}</p>

                    <div className="mt-3 flex flex-wrap gap-4">
                      {layer.links.map((link) =>
                        'internal' in link ? (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            {link.label} &rarr;
                          </Link>
                        ) : (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            {link.label}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* How they work together */}
        <div className="mt-12 p-6 rounded-xl bg-neutral-50 border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">How they work together</h2>
          <p className="mt-2 text-neutral-600">
            Rules are universal constraints (&ldquo;never commit .env files&rdquo;). Skills are optional expertise loaded when needed
            (&ldquo;how to generate release notes in our format&rdquo;). Tools are external capabilities (&ldquo;search the web&rdquo; or &ldquo;query the database&rdquo;).
          </p>
          <p className="mt-2 text-neutral-600">
            A well-configured agent uses all three: rules set boundaries, skills provide domain knowledge, and tools let it take action.
          </p>
        </div>

        {/* Navigation cards */}
        <div className="mt-12 grid sm:grid-cols-2 gap-6">
          <Link
            href="/docs/what-are-skills"
            className="group block p-6 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-neutral-600 group-hover:text-blue-600 transition-colors" />
              <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                What are Agent Skills?
              </h3>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Learn about the SKILL.md format, progressive disclosure, and how agents discover and use skills.
            </p>
          </Link>
          <Link
            href="/docs/create-a-skill"
            className="group block p-6 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-neutral-600 group-hover:text-blue-600 transition-colors" />
              <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                Create an Agent Skill
              </h3>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Step-by-step guide to writing, validating, and publishing your first SKILL.md.
            </p>
          </Link>
          <Link
            href="/docs/skill-best-practices"
            className="group block p-6 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-neutral-600 group-hover:text-blue-600 transition-colors" />
              <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                SKILL.md Best Practices
              </h3>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Practical tips for writing skills that agents use well. Descriptions, structure, testing, and common mistakes.
            </p>
          </Link>
          <Link
            href="/docs/skills-vs-mcp"
            className="group block p-6 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <GitCompare className="w-5 h-5 text-neutral-600 group-hover:text-blue-600 transition-colors" />
              <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                Skills vs MCP Servers
              </h3>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              When to write a skill and when to build an MCP server. A practical decision guide.
            </p>
          </Link>
          <Link
            href="/docs/install-skills"
            className="group block p-6 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-neutral-600 group-hover:text-blue-600 transition-colors" />
              <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                How to Install Skills
              </h3>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Where to put SKILL.md files for Claude Code, Cursor, VS Code, Codex, and Gemini CLI.
            </p>
          </Link>
          <Link
            href="/docs/skill-examples"
            className="group block p-6 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-neutral-600 group-hover:text-blue-600 transition-colors" />
              <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                SKILL.md Examples
              </h3>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Annotated walkthroughs of four skill patterns that work. Steal these structures.
            </p>
          </Link>
          <Link
            href="/docs/what-is-mcp"
            className="group block p-6 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-neutral-600 group-hover:text-blue-600 transition-colors" />
              <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                What is MCP?
              </h3>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Understand the Model Context Protocol — the open standard connecting AI agents to external tools and data.
            </p>
          </Link>
          <Link
            href="/clients"
            className="group block p-6 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-neutral-600 group-hover:text-blue-600 transition-colors" />
              <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                Compatible Agents
              </h3>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              27+ AI agents and tools that support SKILL.md — Claude Code, Cursor, Codex, Gemini CLI, and more.
            </p>
          </Link>
        </div>

        {/* Specs & Standards */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <ScrollText className="w-5 h-5 text-neutral-600" />
            <h2 className="text-xl font-semibold text-neutral-900">Specs &amp; Standards</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'SKILL.md', href: '/specs/skill-md', desc: 'The agent skills format' },
              { label: 'AGENTS.md', href: '/specs/agents-md', desc: 'Project context for AI agents' },
              { label: 'MCP Protocol', href: '/specs/mcp', desc: 'Model Context Protocol' },
              { label: 'CLAUDE.md', href: '/specs/claude-md', desc: 'Project instructions for Claude' },
              { label: '.cursorrules', href: '/specs/cursorrules', desc: 'Custom rules for Cursor' },
              { label: 'llms.txt', href: '/specs/llms-txt', desc: 'Making websites AI-readable' },
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
