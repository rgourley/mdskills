import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How to Install Agent Skills',
  description: 'Step-by-step instructions for installing SKILL.md files on Claude Code, Cursor, VS Code, Codex, and other AI agents. Covers project skills, personal skills, and CLI tools.',
  alternates: { canonical: '/docs/install-skills' },
  openGraph: {
    title: 'How to Install Agent Skills | mdskills.ai',
    description: 'Step-by-step instructions for installing SKILL.md files on Claude Code, Cursor, VS Code, Codex, and other AI agents.',
    url: '/docs/install-skills',
  },
  keywords: [
    'install agent skills',
    'install SKILL.md',
    'Claude Code skills install',
    'Cursor skills install',
    'VS Code agent skills',
    'Codex skills',
    'npx skills',
    'agent skills setup',
  ],
}

const AGENTS = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    projectPath: '.claude/skills/<skill-name>/SKILL.md',
    personalPath: '~/.claude/skills/<skill-name>/SKILL.md',
    notes: (
      <>
        <p className="text-sm text-neutral-600 mb-3">
          Claude Code has the deepest skills support. Skills show up as slash commands &mdash;
          a skill named <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">review-pr</code> becomes{' '}
          <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">/review-pr</code>.
          Claude also loads skills automatically when your request matches a skill&rsquo;s description.
        </p>
        <p className="text-sm text-neutral-600 mb-3">
          If you have existing files in{' '}
          <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">.claude/commands/</code>,
          those still work. Skills are the newer format and support extra features like bundled scripts and
          frontmatter configuration.
        </p>
        <p className="text-sm text-neutral-600">
          Claude Code also supports <strong>plugins</strong>, which can bundle multiple skills together with MCP
          servers and other extensions. Install plugins via{' '}
          <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">/plugins</code> in the CLI.
        </p>
      </>
    ),
    docsUrl: 'https://code.claude.com/docs/en/skills',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    projectPath: '.cursor/skills/<skill-name>/SKILL.md',
    personalPath: '~/.cursor/skills/<skill-name>/SKILL.md',
    notes: (
      <>
        <p className="text-sm text-neutral-600 mb-3">
          Cursor launched its marketplace in February 2026 with support for skills as part of its plugin system.
          Skills are one of five plugin primitives alongside MCP servers, subagents, hooks, and rules.
        </p>
        <p className="text-sm text-neutral-600">
          You can also place skills in{' '}
          <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">.agents/skills/</code> &mdash;
          this path is recognized by multiple agents and is a good choice if your team uses different tools.
        </p>
      </>
    ),
    docsUrl: 'https://docs.cursor.com',
  },
  {
    id: 'vscode',
    name: 'VS Code (Copilot)',
    projectPath: '.github/skills/<skill-name>/SKILL.md',
    personalPath: '~/.copilot/skills/<skill-name>/SKILL.md',
    notes: (
      <>
        <p className="text-sm text-neutral-600 mb-3">
          VS Code supports agent skills through GitHub Copilot. Skills go in{' '}
          <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">.github/skills/</code> for
          project skills, which means they&rsquo;re automatically tracked in version control alongside your code.
        </p>
        <p className="text-sm text-neutral-600 mb-3">
          VS Code also recognizes{' '}
          <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">.claude/skills/</code> and{' '}
          <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">.agents/skills/</code>.
          You can configure additional search paths with the{' '}
          <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">chat.agentSkillsLocations</code> setting.
        </p>
        <p className="text-sm text-neutral-600">
          Type <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">/</code> in the
          Copilot chat to see available skills and invoke them directly.
        </p>
      </>
    ),
    docsUrl: 'https://code.visualstudio.com/docs/copilot/customization/agent-skills',
  },
  {
    id: 'codex',
    name: 'OpenAI Codex',
    projectPath: '.agents/skills/<skill-name>/SKILL.md',
    personalPath: '~/.agents/skills/<skill-name>/SKILL.md',
    notes: (
      <p className="text-sm text-neutral-600">
        Codex uses the{' '}
        <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">.agents/skills/</code> directory
        by default. This is the vendor-neutral path that multiple agents recognize, making it a safe bet if
        you&rsquo;re publishing skills that need to work across different tools.
      </p>
    ),
    docsUrl: 'https://developers.openai.com/codex/skills/',
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    projectPath: '.gemini/skills/<skill-name>/SKILL.md',
    personalPath: '~/.gemini/skills/<skill-name>/SKILL.md',
    notes: (
      <p className="text-sm text-neutral-600">
        Gemini CLI also reads from{' '}
        <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">.agents/skills/</code> as
        a fallback. If you&rsquo;re targeting Gemini CLI specifically, use the{' '}
        <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">.gemini/skills/</code> path.
        For cross-agent compatibility, use <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">.agents/skills/</code>.
      </p>
    ),
    docsUrl: 'https://github.com/google-gemini/gemini-cli',
  },
]

export default function InstallSkillsPage() {
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
            How to Install Agent Skills
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            Skills are just folders with a SKILL.md file. Installing one means putting that folder in
            the right place for your agent. Here&rsquo;s where that place is for each tool.
          </p>
        </div>

        <section className="prose-neutral">

          {/* Universal approach */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">The universal approach</h2>
          <p className="text-neutral-600 mb-4">
            Every agent reads skills from a specific directory. There are two scopes:
          </p>

          <div className="grid sm:grid-cols-2 gap-4 my-6">
            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50">
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">Project skills</h3>
              <p className="text-sm text-neutral-600">
                Live inside your repo. Committed to version control. Available to everyone working on
                that project.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50">
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">Personal skills</h3>
              <p className="text-sm text-neutral-600">
                Live in your home directory. Available across all your projects. Only you can use them.
              </p>
            </div>
          </div>

          {/* Manual download */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Download and save manually</h2>
          <p className="text-neutral-600 mb-4">
            The simplest approach &mdash; no CLI tools needed:
          </p>

          <ol className="list-decimal pl-5 space-y-3 text-neutral-600 mb-4">
            <li>
              <strong>Find a skill</strong> on{' '}
              <Link href="/skills" className="text-blue-600 hover:underline">mdskills.ai</Link> and click the{' '}
              <strong>Download</strong> button on its detail page.
            </li>
            <li>
              <strong>Create the skill folder</strong> in your project. For example, for Claude Code:
              <div className="rounded-lg bg-code-bg border border-neutral-200 text-neutral-800 p-3 font-mono text-sm my-2">
                mkdir -p .claude/skills/my-skill
              </div>
            </li>
            <li>
              <strong>Save the file</strong> as{' '}
              <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">SKILL.md</code> inside that folder:
              <div className="rounded-lg bg-code-bg border border-neutral-200 text-neutral-800 p-3 font-mono text-sm my-2">
                mv ~/Downloads/SKILL.md .claude/skills/my-skill/
              </div>
            </li>
            <li>
              <strong>Restart your agent</strong> (or start a new session). The skill is now available.
            </li>
          </ol>

          <p className="text-neutral-600 mb-4">
            The folder name becomes the skill name. A folder called{' '}
            <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">review-pr</code> becomes
            the <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">/review-pr</code> command
            in agents that support slash commands.
          </p>

          <div className="p-5 rounded-xl bg-blue-50 border border-blue-100 text-sm text-neutral-700 mb-6">
            <strong>Where to save?</strong> See the <a href="#agent-setup" className="text-blue-600 hover:underline">agent-by-agent guide below</a> for
            the exact directory path for your specific tool. The short version: most agents use{' '}
            <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-xs font-mono">.&lt;agent&gt;/skills/&lt;name&gt;/SKILL.md</code> in
            your project root.
          </div>

          {/* CLI install */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Quick install with the CLI</h2>
          <p className="text-neutral-600 mb-4">
            The fastest way to install any skill from a GitHub repo:
          </p>

          <div className="rounded-xl bg-code-bg border border-neutral-200 text-neutral-800 p-4 font-mono text-sm my-6">
            <div className="text-neutral-400"># Install from mdskills.ai</div>
            <div>npx mdskills install &lt;skill-name&gt;</div>
            <div className="mt-3 text-neutral-400"># Or use the Vercel CLI</div>
            <div>npx skills add &lt;owner&gt;/&lt;repo&gt;</div>
            <div className="mt-3 text-neutral-400"># Or install manually &mdash; just clone and copy</div>
            <div>git clone https://github.com/owner/skills-repo.git</div>
            <div>cp -r skills-repo/my-skill .claude/skills/</div>
          </div>

          <p className="text-neutral-600 mb-4">
            CLI tools detect your installed agents and place skills in the right directories automatically.
            But you don&rsquo;t need a CLI &mdash; copying the folder manually works just as well.
          </p>

          {/* Per-agent guides */}
          <h2 id="agent-setup" className="text-xl font-semibold text-neutral-900 mt-10 mb-4 scroll-mt-20">Agent-by-agent setup</h2>

          <div className="space-y-6 my-6">
            {AGENTS.map((agent) => (
              <div key={agent.id} id={agent.id} className="p-5 rounded-xl border border-neutral-200 bg-white scroll-mt-20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-neutral-900">{agent.name}</h3>
                  <a
                    href={agent.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Docs <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-neutral-500 mt-0.5 shrink-0 w-14">Project:</span>
                    <code className="text-xs font-mono text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                      {agent.projectPath}
                    </code>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-neutral-500 mt-0.5 shrink-0 w-14">Personal:</span>
                    <code className="text-xs font-mono text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                      {agent.personalPath}
                    </code>
                  </div>
                </div>

                {agent.notes}
              </div>
            ))}
          </div>

          {/* Cross-agent compatibility */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Cross-agent compatibility</h2>
          <p className="text-neutral-600 mb-4">
            If you&rsquo;re publishing a skill and want it to work everywhere, use the{' '}
            <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">.agents/skills/</code> path.
            Most agents check this directory as a fallback. For project-specific skills where your team all uses
            the same tool, use the vendor-specific path.
          </p>

          <div className="p-5 rounded-xl bg-blue-50 border border-blue-100 text-sm text-neutral-700">
            <strong>Tip:</strong> You can have the same skill in multiple directories. Some teams symlink
            their skills across paths so they work regardless of which agent someone uses. A simple{' '}
            <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-xs font-mono">ln -s</code> does the job.
          </div>

          {/* Verifying */}
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Verify it worked</h2>
          <p className="text-neutral-600 mb-4">
            After installing a skill, check that your agent can see it:
          </p>

          <ul className="list-disc pl-5 space-y-2 text-neutral-600 mb-4">
            <li>
              <strong>Claude Code:</strong> Ask &ldquo;What skills are available?&rdquo; or type{' '}
              <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">/</code> to
              see skills in the autocomplete menu.
            </li>
            <li>
              <strong>VS Code:</strong> Type{' '}
              <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">/</code> in
              the Copilot chat pane.
            </li>
            <li>
              <strong>Any agent:</strong> Ask &ldquo;Do you have a skill for [task]?&rdquo; and see if it
              picks up the description.
            </li>
          </ul>

          <p className="text-neutral-600">
            If the skill doesn&rsquo;t show up, double-check the folder structure. The directory name must contain
            a <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">SKILL.md</code> file (case
            matters).
          </p>

          {/* Links */}
          <div className="mt-12 flex flex-wrap gap-6">
            <Link
              href="/skills"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Browse skills to install &rarr;
            </Link>
            <Link
              href="/docs/create-a-skill"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Create your own &rarr;
            </Link>
            <Link
              href="/docs/skill-best-practices"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Best practices &rarr;
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
