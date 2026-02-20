import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Marketplace</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/skills" className="hover:text-neutral-900 transition-colors">Explore</Link>
              </li>
              <li>
                <Link href="/use-cases" className="hover:text-neutral-900 transition-colors">Use Cases</Link>
              </li>
              <li>
                <Link href="/clients" className="hover:text-neutral-900 transition-colors">Clients</Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-neutral-900 transition-colors">Submit</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Docs</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/docs" className="hover:text-neutral-900 transition-colors">Ecosystem Overview</Link>
              </li>
              <li>
                <Link href="/docs/what-are-skills" className="hover:text-neutral-900 transition-colors">What are Skills?</Link>
              </li>
              <li>
                <Link href="/docs/create-a-skill" className="hover:text-neutral-900 transition-colors">Create a Skill</Link>
              </li>
              <li>
                <Link href="/docs/skill-best-practices" className="hover:text-neutral-900 transition-colors">Best Practices</Link>
              </li>
              <li>
                <Link href="/docs/skills-vs-mcp" className="hover:text-neutral-900 transition-colors">Skills vs MCP</Link>
              </li>
              <li>
                <Link href="/docs/install-skills" className="hover:text-neutral-900 transition-colors">Install Skills</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Specs</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/specs/skill-md" className="hover:text-neutral-900 transition-colors">SKILL.md</Link>
              </li>
              <li>
                <Link href="/specs/agents-md" className="hover:text-neutral-900 transition-colors">AGENTS.md</Link>
              </li>
              <li>
                <Link href="/specs/mcp" className="hover:text-neutral-900 transition-colors">MCP Protocol</Link>
              </li>
              <li>
                <Link href="/specs/claude-md" className="hover:text-neutral-900 transition-colors">CLAUDE.md</Link>
              </li>
              <li>
                <Link href="/specs/llms-txt" className="hover:text-neutral-900 transition-colors">llms.txt</Link>
              </li>
              <li>
                <Link href="/specs" className="hover:text-neutral-900 transition-colors">All specs &rarr;</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Community</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <a href="https://github.com/rgourley/mdskills" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors">GitHub</a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 pt-6 border-t border-neutral-200 text-sm text-neutral-500 text-center sm:text-left">
          The community layer for AI agent skills. Find, create, fork, and share. Created by <a href="https://www.robertcreative.com/" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors">Rob Gourley</a>.
        </p>
      </div>
    </footer>
  )
}
