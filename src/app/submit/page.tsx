import Link from 'next/link'
import { Package, Server, Workflow, Shield, Plug, FileCode } from 'lucide-react'

const ARTIFACT_TYPES = [
  {
    type: 'skill_pack',
    name: 'Agent Skill (SKILL.md)',
    description: 'A reusable SKILL.md file — the open standard for AI agent capabilities. Supported by Claude Code, Cursor, Codex, Gemini CLI, and 27+ agents.',
    icon: Package,
    command: 'npx mdskills init my-skill',
  },
  {
    type: 'mcp_server',
    name: 'MCP Server',
    description: 'A Model Context Protocol server that connects AI agents to external tools, APIs, and data sources.',
    icon: Server,
    command: null,
  },
  {
    type: 'workflow_pack',
    name: 'Workflow Pack',
    description: 'A structured set of prompts and instructions that guide AI agents through multi-step outcomes.',
    icon: Workflow,
    command: 'npx mdskills init my-workflow --type workflow',
  },
  {
    type: 'ruleset',
    name: 'Rules',
    description: 'Configuration rules that shape AI agent behavior. Covers .cursorrules, CLAUDE.md, AGENTS.md, GEMINI.md, .clinerules, and more.',
    icon: Shield,
    command: null,
  },
  {
    type: 'openapi_action',
    name: 'OpenAPI Action',
    description: 'An OpenAPI schema that enables ChatGPT or other tools to call external APIs.',
    icon: Plug,
    command: null,
  },
  {
    type: 'extension',
    name: 'Extension',
    description: 'A VS Code or IDE extension that enhances AI agent capabilities.',
    icon: FileCode,
    command: null,
  },
]

export default function SubmitPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">Submit a Listing</h1>
          <p className="mt-2 text-neutral-600">
            Share your AI capability with the ecosystem. The primary format is{' '}
            <Link href="/docs/what-are-skills" className="text-blue-600 hover:underline font-medium">
              SKILL.md
            </Link>
            {' '}&mdash; the open standard supported by 27+ AI agents.
          </p>
        </div>

        <div className="space-y-4">
          {ARTIFACT_TYPES.map((artifact) => {
            const Icon = artifact.icon
            return (
              <div
                key={artifact.type}
                className="p-6 rounded-xl border border-neutral-200 bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900">{artifact.name}</h3>
                    <p className="mt-1 text-sm text-neutral-600">{artifact.description}</p>
                    {artifact.command ? (
                      <div className="mt-3 p-3 rounded-lg bg-neutral-900 text-white">
                        <code className="font-mono text-sm">{artifact.command}</code>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-neutral-400">
                        Submission via web form coming soon. For now, submit via{' '}
                        <a
                          href="https://github.com/rgourley/mdskills"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          GitHub
                        </a>
                        .
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 p-6 rounded-xl border border-blue-100 bg-blue-50">
          <h3 className="font-semibold text-neutral-900">New to SKILL.md?</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Read our{' '}
            <Link href="/docs/create-a-skill" className="text-blue-600 hover:underline font-medium">
              authoring guide
            </Link>
            {' '}or check the{' '}
            <a
              href="https://agentskills.io/specification"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              official specification
            </a>
            .
          </p>
        </div>

        <div className="mt-8 p-6 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
          <h3 className="font-semibold text-neutral-900">In-browser editor coming soon</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Create and publish listings directly from your browser — no Git or GitHub required.
          </p>
        </div>
      </div>
    </div>
  )
}
