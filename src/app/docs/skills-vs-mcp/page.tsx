import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Skills vs MCP Servers',
  description: 'When should you write a SKILL.md and when should you build an MCP server? A practical guide to choosing the right extension point for your AI agent.',
  alternates: { canonical: '/docs/skills-vs-mcp' },
  openGraph: {
    title: 'Skills vs MCP Servers — mdskills.ai',
    description: 'When should you write a SKILL.md and when should you build an MCP server? A practical guide to choosing the right extension point.',
    url: '/docs/skills-vs-mcp',
  },
  keywords: [
    'skills vs MCP',
    'SKILL.md vs MCP server',
    'MCP vs agent skills',
    'when to use MCP',
    'when to use skills',
    'agent skills comparison',
    'Model Context Protocol',
    'AI agent architecture',
  ],
}

export default function SkillsVsMcpPage() {
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
            Skills vs MCP Servers
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            Both extend what an agent can do. They solve different problems. Here&rsquo;s how to pick.
          </p>
        </div>

        <section className="prose-neutral">

          {/* The short version */}
          <div className="p-5 rounded-xl bg-blue-50 border border-blue-100 text-sm text-neutral-700 mb-10">
            <strong>The one-sentence version:</strong> Skills teach an agent <em>how</em> to do something.
            MCP servers give an agent <em>access</em> to something. If your agent already has the ability but
            lacks the knowledge, write a skill. If it lacks the ability entirely, build an MCP server.
          </div>

          {/* What each one is */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">What they actually are</h2>

          <div className="grid sm:grid-cols-2 gap-4 my-6">
            <div className="p-5 rounded-xl border border-neutral-200 bg-white">
              <h3 className="font-semibold text-neutral-900 mb-2">A Skill</h3>
              <p className="text-sm text-neutral-600">
                A folder with a{' '}
                <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">SKILL.md</code> file.
                Contains instructions, examples, templates, and optionally scripts. The agent reads it and follows
                the directions. No server, no API, no infrastructure.
              </p>
              <p className="text-sm text-neutral-500 mt-3">
                Think of it as a playbook. The agent already has hands &mdash; the skill tells it what to do with them.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-neutral-200 bg-white">
              <h3 className="font-semibold text-neutral-900 mb-2">An MCP Server</h3>
              <p className="text-sm text-neutral-600">
                A running process that exposes tools over the Model Context Protocol. The agent sends requests,
                the server executes them, and returns results. Requires code, a runtime, and usually some
                configuration.
              </p>
              <p className="text-sm text-neutral-500 mt-3">
                Think of it as a new sense organ. The agent couldn&rsquo;t do this before &mdash; now it can.
              </p>
            </div>
          </div>

          {/* When to use which */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">When to use which</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse my-6">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">Situation</th>
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">Use</th>
                  <th className="text-left py-2 font-semibold text-neutral-900">Why</th>
                </tr>
              </thead>
              <tbody className="text-neutral-600">
                <tr className="border-b border-neutral-100">
                  <td className="py-3 pr-4">You want the agent to follow your team&rsquo;s PR review process</td>
                  <td className="py-3 pr-4 font-medium text-neutral-900">Skill</td>
                  <td className="py-3">It already knows how to read code and write comments. It just needs your specific checklist.</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-3 pr-4">You want the agent to query your company&rsquo;s internal database</td>
                  <td className="py-3 pr-4 font-medium text-neutral-900">MCP</td>
                  <td className="py-3">It can&rsquo;t access your database without a server providing that connection.</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-3 pr-4">You want the agent to generate changelogs in a specific format</td>
                  <td className="py-3 pr-4 font-medium text-neutral-900">Skill</td>
                  <td className="py-3">It already knows git. It just needs your format and conventions.</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-3 pr-4">You want the agent to search Slack messages</td>
                  <td className="py-3 pr-4 font-medium text-neutral-900">MCP</td>
                  <td className="py-3">It needs an authenticated connection to the Slack API.</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-3 pr-4">You want the agent to create PPTX presentations</td>
                  <td className="py-3 pr-4 font-medium text-neutral-900">Skill</td>
                  <td className="py-3">A skill can bundle a Python script that does the heavy lifting. No server needed.</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">You want the agent to manage Jira tickets</td>
                  <td className="py-3 pr-4 font-medium text-neutral-900">MCP</td>
                  <td className="py-3">Needs live access to Jira&rsquo;s API with your credentials.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-neutral-600">
            See the pattern? If the task requires <strong>live access to an external system</strong>, you
            need MCP. If the task requires <strong>domain knowledge or a specific process</strong>, you
            need a skill.
          </p>

          {/* The quick test */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">The quick test</h2>
          <p className="text-neutral-600 mb-4">
            Ask yourself two questions:
          </p>

          <div className="space-y-3 my-6">
            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50">
              <p className="text-sm text-neutral-700">
                <strong>1. Could a smart person do this task with just a terminal, a text editor, and the right instructions?</strong>
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                Yes &rarr; Write a skill. No &rarr; You probably need MCP.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50">
              <p className="text-sm text-neutral-700">
                <strong>2. Does the task require authentication, a live API connection, or real-time data from an external service?</strong>
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                Yes &rarr; MCP. No &rarr; Skill.
              </p>
            </div>
          </div>

          {/* Side by side comparison */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Side-by-side comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse my-6">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900"></th>
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">Skills</th>
                  <th className="text-left py-2 font-semibold text-neutral-900">MCP Servers</th>
                </tr>
              </thead>
              <tbody className="text-neutral-600">
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">Format</td>
                  <td className="py-2 pr-4">Markdown + optional scripts</td>
                  <td className="py-2">Running server process</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">Setup time</td>
                  <td className="py-2 pr-4">Minutes</td>
                  <td className="py-2">Hours to days</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">Infrastructure</td>
                  <td className="py-2 pr-4">None &mdash; just files</td>
                  <td className="py-2">Needs a runtime (Node, Python, etc.)</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">Portability</td>
                  <td className="py-2 pr-4">Works across 27+ agents</td>
                  <td className="py-2">Works across MCP-compatible agents</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">External access</td>
                  <td className="py-2 pr-4">No (local files and tools only)</td>
                  <td className="py-2">Yes (APIs, databases, services)</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">Security model</td>
                  <td className="py-2 pr-4">Sandboxed by the agent&rsquo;s permissions</td>
                  <td className="py-2">Server controls its own access</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-neutral-900">Best for</td>
                  <td className="py-2 pr-4">Workflows, conventions, templates</td>
                  <td className="py-2">External integrations, data access</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Using them together */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">They work best together</h2>
          <p className="text-neutral-600 mb-4">
            This isn&rsquo;t either/or. The most effective setups use both. MCP gives the agent <em>abilities</em>.
            Skills teach the agent how to use those abilities <em>well</em>.
          </p>

          <div className="rounded-xl bg-code-bg border border-neutral-200 text-neutral-800 p-4 font-mono text-sm my-6">
            <div className="text-neutral-400"># Example: Jira integration</div>
            <div className="mt-2">MCP server &rarr; provides create_ticket, search_tickets,</div>
            <div>               update_ticket tools</div>
            <div className="mt-2">Skill &rarr; teaches the agent your team&rsquo;s ticket conventions:</div>
            <div>         title format, required labels, when to create</div>
            <div>         a bug vs. a task, how to link to PRs</div>
          </div>

          <p className="text-neutral-600">
            Without the MCP server, the agent can&rsquo;t talk to Jira. Without the skill, it creates
            tickets that don&rsquo;t follow your process. You need both.
          </p>

          {/* Common misconceptions */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Misconceptions</h2>

          <div className="space-y-4 my-6">
            <div className="p-4 rounded-lg border border-neutral-200">
              <p className="text-sm text-neutral-700">
                <strong>&ldquo;Skills are just prompts.&rdquo;</strong>
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                Skills can bundle scripts, reference files, templates, and assets. A PDF processing skill
                might include a Python script that does the actual extraction. The markdown tells the agent
                when and how to run it.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-neutral-200">
              <p className="text-sm text-neutral-700">
                <strong>&ldquo;MCP is always better because it&rsquo;s more powerful.&rdquo;</strong>
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                More powerful isn&rsquo;t always better. Building an MCP server for something a skill
                handles in 20 lines of markdown is over-engineering. Skills are faster to write, easier
                to share, and work across more agents.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-neutral-200">
              <p className="text-sm text-neutral-700">
                <strong>&ldquo;Skills are going away now that MCP exists.&rdquo;</strong>
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                The opposite. Skills adoption is accelerating. They solve a fundamentally different problem
                than MCP &mdash; teaching vs. connecting. Both are part of the agent ecosystem and both
                are actively supported by major platforms.
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="mt-12 flex flex-wrap gap-6">
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              MCP Protocol <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://agentskills.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Agent Skills Spec <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Link
              href="/docs/what-are-skills"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              What are Skills? &rarr;
            </Link>
            <Link
              href="/specs/mcp"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              MCP Spec &rarr;
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
