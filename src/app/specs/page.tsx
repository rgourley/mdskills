import Link from 'next/link'
import { ExternalLink, FileText, Bot, Plug, Globe, FileCode, BookOpen, Heart } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Agent Specifications & Standards',
  description: 'A guide to the open standards powering AI coding agents — SKILL.md, AGENTS.md, MCP, llms.txt, .cursorrules, CLAUDE.md and more. Learn how each format works and when to use it.',
  alternates: { canonical: '/specs' },
  openGraph: {
    title: 'AI Agent Specifications & Standards | mdskills.ai',
    description: 'A guide to the open standards powering AI coding agents. SKILL.md, AGENTS.md, MCP Protocol, llms.txt, .cursorrules, CLAUDE.md.',
    url: '/specs',
  },
  keywords: ['AI agent specs', 'SKILL.md', 'AGENTS.md', 'MCP protocol', 'llms.txt', 'cursorrules', 'CLAUDE.md', 'AI coding standards'],
}

const SPECS = [
  {
    href: '/specs/skill-md',
    icon: FileText,
    name: 'SKILL.md',
    tagline: 'The Agent Skills Format',
    description: 'Modular, on-demand capabilities for AI coding agents. The open standard for teaching agents new tasks.',
    org: 'agentskills.io',
  },
  {
    href: '/specs/agents-md',
    icon: Bot,
    name: 'AGENTS.md',
    tagline: 'Project Context for AI Agents',
    description: 'Project-level instructions that give AI agents context about your codebase, conventions, and build steps.',
    org: 'Linux Foundation',
  },
  {
    href: '/specs/mcp',
    icon: Plug,
    name: 'MCP',
    tagline: 'Model Context Protocol',
    description: 'A universal protocol for connecting AI models to external tools, data sources, and services.',
    org: 'Anthropic',
  },
  {
    href: '/specs/llms-txt',
    icon: Globe,
    name: 'llms.txt',
    tagline: 'Making Websites AI-Readable',
    description: 'A simple text file that helps AI models understand your website content in a structured, machine-friendly way.',
    org: 'Community Standard',
  },
  {
    href: '/specs/cursorrules',
    icon: FileCode,
    name: '.cursorrules',
    tagline: 'Custom Rules for Cursor',
    description: 'Project-level configuration that tells Cursor how to write code for your specific codebase and conventions.',
    org: 'Cursor / Anysphere',
  },
  {
    href: '/specs/claude-md',
    icon: BookOpen,
    name: 'CLAUDE.md',
    tagline: 'Project Instructions for Claude',
    description: 'A markdown file that gives Claude Code persistent context about your project, style preferences, and workflows.',
    org: 'Anthropic',
  },
  {
    href: '/specs/soul-md',
    icon: Heart,
    name: 'SOUL.md',
    tagline: 'Personal Identity for AI Agents',
    description: 'A markdown file that encodes your personality, voice, worldview, and opinions so AI agents can embody your identity.',
    org: 'Aaron Mars / OpenClaw',
  },
]

export default function SpecsPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-neutral-900">
            AI Agent Specifications & Standards
          </h1>
          <p className="mt-3 text-lg text-neutral-600 max-w-2xl">
            The AI coding ecosystem is converging on a set of open formats and protocols.
            Each standard solves a different problem — from teaching agents new skills to connecting
            them with external tools. Here&rsquo;s what you need to know about each one.
          </p>
        </div>

        <div className="grid gap-4">
          {SPECS.map((spec) => {
            const Icon = spec.icon
            return (
              <Link
                key={spec.href}
                href={spec.href}
                className="group flex items-start gap-5 p-6 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-neutral-100 group-hover:bg-neutral-200 flex items-center justify-center transition-colors">
                  <Icon className="w-5 h-5 text-neutral-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-lg font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                      {spec.name}
                    </h2>
                    <span className="text-sm text-neutral-400">{spec.tagline}</span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">
                    {spec.description}
                  </p>
                  <p className="mt-2 text-xs text-neutral-400">{spec.org}</p>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 p-6 rounded-xl bg-neutral-50 border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">How these standards work together</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Think of it in three layers: <strong>Rules</strong> (CLAUDE.md, .cursorrules) set project-wide constraints
            that apply to every task. <strong>Skills</strong> (SKILL.md) provide modular capabilities loaded on demand
            for specific tasks. <strong>Tools</strong> (MCP servers) connect agents to external services and data sources.
            And <strong>llms.txt</strong> makes your documentation discoverable by AI models.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link href="/docs" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Read the ecosystem overview &rarr;
            </Link>
            <Link href="/skills" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Browse skills &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
