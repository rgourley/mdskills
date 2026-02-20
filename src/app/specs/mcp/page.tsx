import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MCP — Model Context Protocol',
  description: 'The Model Context Protocol (MCP) is an open standard for connecting AI models to external tools, data sources, and services. Learn how MCP servers work and who supports them.',
  alternates: { canonical: '/specs/mcp' },
  openGraph: {
    title: 'MCP — Model Context Protocol — mdskills.ai',
    description: 'An open standard for connecting AI models to external tools, data sources, and services. Supported by Claude, Cursor, VS Code, and more.',
    url: '/specs/mcp',
  },
  keywords: ['MCP', 'Model Context Protocol', 'MCP server', 'MCP protocol', 'AI tools protocol', 'Anthropic MCP'],
}

export default function McpPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/specs" className="text-sm text-neutral-500 hover:text-neutral-700 mb-8 inline-block">
          &larr; Specs
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">
            MCP — Model Context Protocol
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            The Model Context Protocol (MCP) is an open standard created by{' '}
            <a href="https://anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Anthropic
            </a>{' '}
            for connecting AI models to external tools, data sources, and services.
            It provides a universal way for AI agents to call functions, query databases,
            access APIs, and interact with the world beyond their training data.
          </p>
        </div>

        <section className="prose-neutral">
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">What problem does it solve?</h2>
          <p className="text-neutral-600 mb-4">
            AI models are powerful reasoners but can&rsquo;t natively access files, databases, APIs, or external services.
            Before MCP, every integration was custom — each tool vendor built their own protocol for each AI platform.
            MCP standardizes this: build one MCP server and it works with every compatible client.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">How it works</h2>
          <p className="text-neutral-600 mb-4">
            An MCP server is a lightweight process that exposes <strong>tools</strong> (functions the AI can call),
            <strong> resources</strong> (data the AI can read), and <strong>prompts</strong> (templates for common tasks).
            The AI client discovers available capabilities at startup and invokes them as needed.
          </p>

          <div className="rounded-xl bg-code-bg border border-neutral-200 text-neutral-800 p-6 font-mono text-sm my-6 overflow-x-auto">
            <div className="text-neutral-400"># Add an MCP server to Claude Code</div>
            <div className="mt-1">claude mcp add my-server -- npx -y my-mcp-server</div>
            <div className="mt-4 text-neutral-400"># Or configure in .cursor/mcp.json</div>
            <div className="mt-1">{'{'}</div>
            <div>  <span className="text-blue-600">&quot;mcpServers&quot;</span>: {'{'}</div>
            <div>    <span className="text-blue-600">&quot;my-server&quot;</span>: {'{'}</div>
            <div>      <span className="text-blue-600">&quot;command&quot;</span>: <span className="text-green-700">&quot;npx&quot;</span>,</div>
            <div>      <span className="text-blue-600">&quot;args&quot;</span>: [<span className="text-green-700">&quot;-y&quot;</span>, <span className="text-green-700">&quot;my-mcp-server&quot;</span>]</div>
            <div>    {'}'}</div>
            <div>  {'}'}</div>
            <div>{'}'}</div>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">MCP capabilities</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse my-4">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">Capability</th>
                  <th className="text-left py-2 font-semibold text-neutral-900">Description</th>
                </tr>
              </thead>
              <tbody className="text-neutral-600">
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">Tools</td>
                  <td className="py-2">Functions the AI can call — query a database, create a file, send a message</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">Resources</td>
                  <td className="py-2">Data the AI can read — files, database records, API responses</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-neutral-900">Prompts</td>
                  <td className="py-2">Reusable prompt templates that users can invoke</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">MCP vs SKILL.md</h2>
          <p className="text-neutral-600 mb-4">
            MCP servers and SKILL.md files complement each other. A <strong>skill</strong> teaches an agent
            <em> how to approach a task</em> — it&rsquo;s instructions in markdown. An <strong>MCP server</strong> gives
            the agent <em>new capabilities</em> — it&rsquo;s executable code that extends what the agent can do.
            For example, a PDF skill teaches the agent best practices for working with PDFs, while a PDF MCP server
            gives the agent actual tools to read, split, and merge PDF files.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Who supports it</h2>
          <p className="text-neutral-600 mb-4">
            MCP is supported by Claude Desktop, Claude Code, Cursor, VS Code (via GitHub Copilot),
            Windsurf, Continue, OpenCode, Cline, Roo Code, and a growing number of AI development tools.
            The ecosystem includes thousands of community-built MCP servers for databases, APIs, cloud services, and more.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Related specs</h2>
          <ul className="space-y-1 text-neutral-600">
            <li><Link href="/specs/skill-md" className="text-blue-600 hover:underline">SKILL.md</Link> — for teaching agents how to approach tasks</li>
            <li><Link href="/specs/agents-md" className="text-blue-600 hover:underline">AGENTS.md</Link> — for project-level context</li>
          </ul>
        </section>

        <div className="mt-12 p-6 rounded-xl bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900">Official Specification</h3>
          <p className="mt-1 text-sm text-blue-800">
            The MCP specification and documentation are maintained by Anthropic.
          </p>
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            Read the MCP documentation <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
