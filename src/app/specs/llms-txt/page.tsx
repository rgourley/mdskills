import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'llms.txt — Making Websites AI-Readable',
  description: 'llms.txt is a simple standard for making your website content accessible to AI models. Like robots.txt for search engines, but designed for LLMs. Learn the format and how to add it.',
  alternates: { canonical: '/specs/llms-txt' },
  openGraph: {
    title: 'llms.txt — Making Websites AI-Readable — mdskills.ai',
    description: 'A simple standard for making website content accessible to AI models. Like robots.txt, but for LLMs.',
    url: '/specs/llms-txt',
  },
  keywords: ['llms.txt', 'llms txt', 'llms.txt spec', 'AI readable website', 'LLM website format', 'llmstxt'],
}

export default function LlmsTxtPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/specs" className="text-sm text-neutral-500 hover:text-neutral-700 mb-8 inline-block">
          &larr; Specs
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">
            llms.txt — Making Websites AI-Readable
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            llms.txt is a community standard for providing AI models with a clean, structured summary
            of your website or documentation. Think of it like{' '}
            <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">robots.txt</code> for
            search engine crawlers, but designed for large language models. The specification is maintained
            at{' '}
            <a href="https://llmstxt.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              llmstxt.org
            </a>.
          </p>
        </div>

        <section className="prose-neutral">
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">What problem does it solve?</h2>
          <p className="text-neutral-600 mb-4">
            Websites are designed for humans — they have navigation, footers, sidebars, JavaScript, and complex layouts
            that make it hard for AI models to extract the actual content. llms.txt gives models a single, clean
            entry point that lists what your site offers and links to the most important pages in markdown format.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">How it works</h2>
          <p className="text-neutral-600 mb-4">
            Place an <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">llms.txt</code> file
            at your website root (e.g., <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">example.com/llms.txt</code>).
            It starts with a title and description, then lists key sections with links.
          </p>

          <div className="rounded-xl bg-neutral-900 text-white p-6 font-mono text-sm my-6 overflow-x-auto">
            <div className="text-green-400"># mdskills.ai</div>
            <div className="mt-2 text-neutral-300">&gt; AI skills marketplace for Claude Code, Cursor,</div>
            <div className="text-neutral-300">&gt; Codex, and 27+ AI coding agents.</div>
            <div className="mt-3 text-green-400">## Docs</div>
            <div className="text-neutral-300">- [What are Skills](/docs/what-are-skills): Learn about</div>
            <div className="text-neutral-300">  the SKILL.md format and how agents use skills</div>
            <div className="text-neutral-300">- [Create a Skill](/docs/create-a-skill): Step-by-step</div>
            <div className="text-neutral-300">  guide to authoring your first skill</div>
            <div className="mt-3 text-green-400">## Specs</div>
            <div className="text-neutral-300">- [SKILL.md](/specs/skill-md): The agent skills format</div>
            <div className="text-neutral-300">- [MCP](/specs/mcp): Model Context Protocol</div>
            <div className="mt-3 text-green-400">## API</div>
            <div className="text-neutral-300">- [Skills API](/api/skills): Search and browse skills</div>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Format rules</h2>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 ml-2">
            <li>Start with an H1 heading (<code className="px-1 py-0.5 bg-neutral-100 rounded text-xs"># Site Name</code>)</li>
            <li>Follow with a blockquote description</li>
            <li>Use H2 sections to organize content areas</li>
            <li>List important pages as markdown links with brief descriptions</li>
            <li>Keep it concise — this is an overview, not a complete sitemap</li>
            <li>Optionally provide <code className="px-1 py-0.5 bg-neutral-100 rounded text-xs">llms-full.txt</code> with expanded content</li>
          </ul>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">When to use it</h2>
          <p className="text-neutral-600 mb-4">
            Add llms.txt if you want AI models to accurately understand and reference your website content.
            It&rsquo;s especially useful for documentation sites, API references, developer tools, and any
            site where AI assistants might need to point users to the right resources.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Who supports it</h2>
          <p className="text-neutral-600 mb-4">
            llms.txt is a community-driven standard gaining adoption across the web. AI tools like Claude,
            ChatGPT, and Perplexity can use llms.txt files when provided as context. Documentation platforms
            like Mintlify, Docusaurus, and ReadMe are adding support for auto-generating llms.txt files.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Related specs</h2>
          <ul className="space-y-1 text-neutral-600">
            <li><Link href="/specs/skill-md" className="text-blue-600 hover:underline">SKILL.md</Link> — for teaching AI agents specific capabilities</li>
            <li><Link href="/specs/agents-md" className="text-blue-600 hover:underline">AGENTS.md</Link> — for project-level AI agent context</li>
          </ul>
        </section>

        <div className="mt-12 p-6 rounded-xl bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900">Official Specification</h3>
          <p className="mt-1 text-sm text-blue-800">
            The llms.txt specification and examples are maintained at llmstxt.org.
          </p>
          <a
            href="https://llmstxt.org"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            Read the llms.txt specification <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
