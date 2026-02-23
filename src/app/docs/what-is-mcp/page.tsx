import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'What is MCP?',
  description: 'Understand the Model Context Protocol (MCP) — the open standard that connects AI agents to external tools, APIs, and data sources. Learn how it works and why it matters.',
  alternates: { canonical: '/docs/what-is-mcp' },
  openGraph: {
    title: 'What is MCP? | mdskills.ai',
    description: 'The Model Context Protocol (MCP) is an open standard that gives AI agents access to external tools, APIs, and data. Learn how it works.',
    url: '/docs/what-is-mcp',
  },
  keywords: [
    'MCP',
    'Model Context Protocol',
    'MCP server',
    'MCP tools',
    'AI agent tools',
    'MCP explained',
    'what is MCP',
    'MCP tutorial',
    'Claude MCP',
    'Cursor MCP',
  ],
}

export default function WhatIsMcpPage() {
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
            What is MCP?
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            The Model Context Protocol gives AI agents the ability to use external tools, query data, and take action in the real world.
          </p>
        </div>

        <section className="prose-neutral">

          {/* TL;DR */}
          <div className="p-5 rounded-xl bg-green-50 border border-green-100 text-sm text-neutral-700 mb-10">
            <strong>TL;DR:</strong> MCP is an open protocol that lets AI agents talk to external services.
            An MCP server exposes <em>tools</em> (functions the agent can call), <em>resources</em> (data the agent
            can read), and <em>prompts</em> (templates for common tasks). The agent discovers what&rsquo;s available
            and uses them as needed.
          </div>

          {/* The problem */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">The problem MCP solves</h2>
          <p className="text-neutral-600 mb-4">
            AI agents are great at reasoning, writing, and working with code. But on their own, they can&rsquo;t
            check your Slack messages, query a database, create a Jira ticket, or search the web. They&rsquo;re
            stuck in a sandbox.
          </p>
          <p className="text-neutral-600 mb-4">
            Before MCP, every integration was custom. Each agent had its own plugin format, its own API,
            and its own way of connecting to tools. If you built a Slack integration for one agent, you had
            to rebuild it for another.
          </p>
          <p className="text-neutral-600">
            MCP standardizes this. Build one MCP server, and it works with every agent that supports the protocol.
          </p>

          {/* How it works */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">How MCP works</h2>
          <p className="text-neutral-600 mb-4">
            MCP follows a client-server architecture. The AI agent is the <strong>client</strong>. The external
            service is the <strong>server</strong>. They communicate over a standardized protocol.
          </p>

          <div className="rounded-xl bg-code-bg border border-neutral-200 text-neutral-800 p-5 font-mono text-sm my-6">
            <div className="text-neutral-400"># The flow</div>
            <div className="mt-2">
              <span className="text-blue-600">Agent</span> &rarr; discovers available tools &rarr; <span className="text-green-600">MCP Server</span>
            </div>
            <div>
              <span className="text-blue-600">Agent</span> &rarr; calls a tool with arguments &rarr; <span className="text-green-600">MCP Server</span>
            </div>
            <div>
              <span className="text-green-600">MCP Server</span> &rarr; executes and returns results &rarr; <span className="text-blue-600">Agent</span>
            </div>
          </div>

          <p className="text-neutral-600 mb-4">
            When an agent connects to an MCP server, it asks: &ldquo;What can you do?&rdquo; The server
            responds with a list of tools, each with a name, description, and input schema. The agent can
            then decide when and how to use them.
          </p>

          {/* Three primitives */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">The three primitives</h2>
          <p className="text-neutral-600 mb-4">
            MCP servers can expose three types of capabilities:
          </p>

          <div className="grid sm:grid-cols-3 gap-4 my-6">
            <div className="p-5 rounded-xl border border-neutral-200 bg-white">
              <h3 className="font-semibold text-neutral-900 mb-2">Tools</h3>
              <p className="text-sm text-neutral-600">
                Functions the agent can call. Like API endpoints with typed inputs and outputs.
                Examples: <code className="px-1 py-0.5 rounded bg-neutral-100 text-xs font-mono">search_emails</code>,{' '}
                <code className="px-1 py-0.5 rounded bg-neutral-100 text-xs font-mono">create_ticket</code>,{' '}
                <code className="px-1 py-0.5 rounded bg-neutral-100 text-xs font-mono">run_query</code>.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-neutral-200 bg-white">
              <h3 className="font-semibold text-neutral-900 mb-2">Resources</h3>
              <p className="text-sm text-neutral-600">
                Read-only data the agent can access. Like files or API responses the agent can pull in for context.
                Examples: config files, database schemas, documentation.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-neutral-200 bg-white">
              <h3 className="font-semibold text-neutral-900 mb-2">Prompts</h3>
              <p className="text-sm text-neutral-600">
                Reusable templates for common interactions. The server provides structured prompts that the agent
                or user can invoke. Examples: &ldquo;summarize this PR&rdquo;, &ldquo;explain this error&rdquo;.
              </p>
            </div>
          </div>

          <p className="text-neutral-600">
            Most MCP servers focus on <strong>tools</strong> — they give the agent new abilities. Resources
            and prompts are useful but less commonly implemented.
          </p>

          {/* Example */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">What an MCP server looks like</h2>
          <p className="text-neutral-600 mb-4">
            Here&rsquo;s a minimal MCP server in TypeScript that provides a single tool:
          </p>

          <div className="rounded-xl bg-code-bg border border-neutral-200 text-neutral-800 p-5 font-mono text-sm my-6 overflow-x-auto">
            <pre className="text-xs leading-relaxed">{`import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "weather",
  version: "1.0.0",
});

server.tool("get_weather",
  { city: z.string() },
  async ({ city }) => {
    const data = await fetch(
      \`https://api.weather.com/v1/\${city}\`
    ).then(r => r.json());
    return {
      content: [{
        type: "text",
        text: \`\${city}: \${data.temp}°F, \${data.condition}\`,
      }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);`}</pre>
          </div>

          <p className="text-neutral-600">
            That&rsquo;s it. The agent can now ask for the weather in any city. It discovers the{' '}
            <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">get_weather</code> tool,
            sees it takes a <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">city</code> string,
            and calls it when relevant.
          </p>

          {/* Connecting to an agent */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Connecting MCP servers to agents</h2>
          <p className="text-neutral-600 mb-4">
            Each agent has its own way of registering MCP servers. Here are the most common:
          </p>

          <div className="space-y-3 my-6">
            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50">
              <p className="text-sm font-medium text-neutral-900">Claude Code</p>
              <code className="block mt-1 text-xs font-mono text-neutral-600">claude mcp add my-server -- npx -y my-mcp-server</code>
            </div>
            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50">
              <p className="text-sm font-medium text-neutral-900">Cursor</p>
              <p className="text-xs font-mono text-neutral-600 mt-1">
                Add to <code>.cursor/mcp.json</code>:
              </p>
              <pre className="mt-1 text-xs font-mono text-neutral-600">{`{ "mcpServers": { "my-server": { "command": "npx", "args": ["-y", "my-mcp-server"] } } }`}</pre>
            </div>
            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50">
              <p className="text-sm font-medium text-neutral-900">VS Code (Copilot)</p>
              <p className="text-xs font-mono text-neutral-600 mt-1">
                Add to <code>.vscode/mcp.json</code> with the same format as Cursor.
              </p>
            </div>
          </div>

          {/* Transports */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Transport options</h2>
          <p className="text-neutral-600 mb-4">
            MCP servers communicate with agents through one of two transports:
          </p>

          <div className="grid sm:grid-cols-2 gap-4 my-6">
            <div className="p-5 rounded-xl border border-neutral-200 bg-white">
              <h3 className="font-semibold text-neutral-900 mb-2">stdio</h3>
              <p className="text-sm text-neutral-600">
                The agent spawns the server as a child process and communicates via stdin/stdout.
                This is the most common transport for local development and CLI-based agents.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-neutral-200 bg-white">
              <h3 className="font-semibold text-neutral-900 mb-2">Streamable HTTP</h3>
              <p className="text-sm text-neutral-600">
                The server runs as an HTTP endpoint. The agent sends requests over HTTP with optional
                Server-Sent Events for streaming. Used for remote and shared servers.
              </p>
            </div>
          </div>

          {/* Which agents support MCP */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Which agents support MCP?</h2>
          <p className="text-neutral-600 mb-4">
            MCP adoption is growing rapidly. Agents with MCP support include:
          </p>

          <div className="flex flex-wrap gap-2 my-6">
            {[
              'Claude Code', 'Claude Desktop', 'Cursor', 'VS Code (Copilot)', 'Windsurf',
              'Continue', 'Gemini CLI', 'Amp', 'Roo Code', 'Goose',
            ].map((agent) => (
              <span key={agent} className="px-3 py-1.5 rounded-lg bg-neutral-100 text-sm text-neutral-700">
                {agent}
              </span>
            ))}
          </div>

          {/* MCP vs Skills */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">MCP vs Skills</h2>
          <p className="text-neutral-600 mb-4">
            MCP and Skills solve different problems. MCP gives agents <em>new abilities</em> (access to
            external systems). Skills give agents <em>domain knowledge</em> (how to do specific tasks well).
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse my-6">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900"></th>
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">MCP Servers</th>
                  <th className="text-left py-2 font-semibold text-neutral-900">Skills</th>
                </tr>
              </thead>
              <tbody className="text-neutral-600">
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">Purpose</td>
                  <td className="py-2 pr-4">Give access to external systems</td>
                  <td className="py-2">Teach how to do tasks well</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">Format</td>
                  <td className="py-2 pr-4">Running server process</td>
                  <td className="py-2">Markdown files</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">Setup</td>
                  <td className="py-2 pr-4">Install + configure</td>
                  <td className="py-2">Drop a file in your project</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">Example</td>
                  <td className="py-2 pr-4">Query a Postgres database</td>
                  <td className="py-2">Write SQL following your team&rsquo;s conventions</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-neutral-900">Together</td>
                  <td className="py-2 pr-4" colSpan={2}>
                    MCP provides the connection. Skills teach the agent how to use it well.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-neutral-600">
            For a deeper comparison, see{' '}
            <Link href="/docs/skills-vs-mcp" className="text-blue-600 hover:text-blue-700 font-medium">
              Skills vs MCP Servers
            </Link>.
          </p>

          {/* Getting started */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Getting started</h2>
          <div className="space-y-3 my-6">
            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50">
              <p className="text-sm text-neutral-700">
                <strong>1. Browse MCP servers</strong> &mdash; Find servers for the tools you use on{' '}
                <Link href="/mcp" className="text-blue-600 hover:text-blue-700 font-medium">
                  our MCP directory
                </Link>{' '}
                or the{' '}
                <a
                  href="https://github.com/modelcontextprotocol/servers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  official MCP servers repo
                </a>.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50">
              <p className="text-sm text-neutral-700">
                <strong>2. Install one</strong> &mdash; Most servers install with a single command.
                Try <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-xs font-mono">claude mcp add</code> for
                Claude Code or add to your agent&rsquo;s MCP config file.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50">
              <p className="text-sm text-neutral-700">
                <strong>3. Build your own</strong> &mdash; The{' '}
                <a
                  href="https://modelcontextprotocol.io/quickstart/server"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  MCP quickstart guide
                </a>{' '}
                walks you through building a server in TypeScript or Python in under 15 minutes.
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
              MCP Protocol Docs <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://github.com/modelcontextprotocol/servers"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Official MCP Servers <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Link
              href="/docs/skills-vs-mcp"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Skills vs MCP &rarr;
            </Link>
            <Link
              href="/mcp"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Browse MCP Servers &rarr;
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
