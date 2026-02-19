import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create an Agent Skill — mdskills.ai',
  description: 'Step-by-step guide to writing, validating, and publishing your first SKILL.md.',
}

const STEPS = [
  {
    number: 1,
    title: 'Create the folder structure',
    content: (
      <>
        <p className="text-neutral-600 mb-3">
          A skill is just a folder with a <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">SKILL.md</code> file inside it.
          The folder name must match the skill name in your frontmatter.
        </p>
        <div className="rounded-xl bg-neutral-900 text-white p-4 font-mono text-sm">
          <div className="text-neutral-400"># Quick start</div>
          <div>mkdir my-skill && touch my-skill/SKILL.md</div>
          <div className="mt-2 text-neutral-400"># Or use the CLI</div>
          <div>npx mdskills init my-skill</div>
        </div>
      </>
    ),
  },
  {
    number: 2,
    title: 'Write the frontmatter',
    content: (
      <>
        <p className="text-neutral-600 mb-3">
          Start your SKILL.md with YAML frontmatter. Two fields are required:{' '}
          <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">name</code> and{' '}
          <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono">description</code>.
        </p>
        <div className="rounded-xl bg-neutral-900 text-white p-4 font-mono text-sm overflow-x-auto">
          <div className="text-neutral-400">---</div>
          <div><span className="text-blue-400">name</span>: my-skill</div>
          <div><span className="text-blue-400">description</span>: Generates changelog entries from</div>
          <div>  git commit history. Use when the user asks to</div>
          <div>  create release notes or update a CHANGELOG.</div>
          <div><span className="text-neutral-500">license</span>: MIT</div>
          <div><span className="text-neutral-500">compatibility</span>: Requires git</div>
          <div className="text-neutral-400">---</div>
        </div>
        <div className="mt-3 space-y-2 text-sm text-neutral-600">
          <p><strong>name:</strong> Lowercase letters, numbers, and hyphens only. Max 64 characters. Must match the folder name.</p>
          <p><strong>description:</strong> What the skill does and when to use it. Be specific — agents use this to decide whether to activate the skill. Max 1024 characters.</p>
        </div>
      </>
    ),
  },
  {
    number: 3,
    title: 'Write the instructions',
    content: (
      <>
        <p className="text-neutral-600 mb-3">
          After the frontmatter, write markdown instructions. There are no format restrictions — use whatever structure helps the agent succeed.
        </p>
        <div className="rounded-xl bg-neutral-900 text-white p-4 font-mono text-sm overflow-x-auto">
          <div className="text-green-400"># Changelog Generator</div>
          <div></div>
          <div className="text-green-400">## When to use this skill</div>
          <div>Use when the user asks to create release notes,</div>
          <div>update a CHANGELOG, or summarize recent changes.</div>
          <div></div>
          <div className="text-green-400">## Steps</div>
          <div>1. Run `git log --oneline` to get recent commits</div>
          <div>2. Group commits by type (feat, fix, docs, etc.)</div>
          <div>3. Generate a markdown changelog entry</div>
          <div>4. Prepend to CHANGELOG.md</div>
          <div></div>
          <div className="text-green-400">## Output format</div>
          <div>Use Keep a Changelog format (keepachangelog.com).</div>
        </div>
        <div className="mt-3 text-sm text-neutral-500">
          Tip: Keep the main SKILL.md under 500 lines. Move detailed reference material to separate files.
        </div>
      </>
    ),
  },
  {
    number: 4,
    title: 'Add supporting files (optional)',
    content: (
      <>
        <p className="text-neutral-600 mb-3">
          Skills can include additional directories for scripts, references, and assets. These are loaded on demand by the agent.
        </p>
        <div className="space-y-3 text-sm">
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
            <span className="font-mono text-xs text-neutral-700">scripts/</span>
            <span className="text-neutral-600 ml-2">— Executable code (Python, Bash, JavaScript). Should be self-contained with helpful error messages.</span>
          </div>
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
            <span className="font-mono text-xs text-neutral-700">references/</span>
            <span className="text-neutral-600 ml-2">— Additional documentation. Keep files focused — agents load these on demand.</span>
          </div>
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
            <span className="font-mono text-xs text-neutral-700">assets/</span>
            <span className="text-neutral-600 ml-2">— Static resources: templates, schemas, images, lookup tables.</span>
          </div>
        </div>
      </>
    ),
  },
  {
    number: 5,
    title: 'Validate',
    content: (
      <>
        <p className="text-neutral-600 mb-3">
          Use the{' '}
          <a href="https://github.com/agentskills/agentskills/tree/main/skills-ref" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            skills-ref
          </a>
          {' '}reference library to check your skill follows the spec:
        </p>
        <div className="rounded-xl bg-neutral-900 text-white p-4 font-mono text-sm">
          <div>skills-ref validate ./my-skill</div>
        </div>
        <p className="mt-3 text-sm text-neutral-600">
          This checks that your frontmatter is valid, naming conventions are followed, and the skill structure is correct.
        </p>
      </>
    ),
  },
  {
    number: 6,
    title: 'Publish',
    content: (
      <>
        <p className="text-neutral-600 mb-3">
          Push your skill to a GitHub repository, then submit it to the marketplace:
        </p>
        <div className="rounded-xl bg-neutral-900 text-white p-4 font-mono text-sm">
          <div className="text-neutral-400"># Push to GitHub first, then:</div>
          <div>npx mdskills publish</div>
        </div>
        <p className="mt-3 text-sm text-neutral-600">
          Or{' '}
          <Link href="/submit" className="text-blue-600 hover:underline">submit manually</Link>
          {' '}through the website.
        </p>
      </>
    ),
  },
]

export default function CreateASkillPage() {
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
            Create an Agent Skill
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            A step-by-step guide to writing, validating, and publishing your first SKILL.md.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {STEPS.map((step) => (
            <div key={step.number} className="relative pl-12">
              <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm font-bold">
                {step.number}
              </div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-3">{step.title}</h2>
              {step.content}
            </div>
          ))}
        </div>

        {/* Best practices */}
        <div className="mt-12 p-6 rounded-xl bg-blue-50 border border-blue-100">
          <h2 className="text-lg font-semibold text-neutral-900 mb-3">Best Practices</h2>
          <ul className="space-y-2 text-sm text-neutral-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">1.</span>
              <span><strong>Write for the agent, not the human.</strong> Be explicit about steps, file paths, and expected outputs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">2.</span>
              <span><strong>Write a great description.</strong> This is what agents use to decide whether to activate your skill. Include specific keywords.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">3.</span>
              <span><strong>Include &ldquo;when to use&rdquo; and &ldquo;when NOT to use&rdquo; sections.</strong> Clear boundaries prevent the skill from being activated for the wrong task.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">4.</span>
              <span><strong>Keep SKILL.md under 500 lines.</strong> Move detailed references to separate files for efficient context use.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">5.</span>
              <span><strong>Test with multiple agents.</strong> Try your skill with Claude Code, Cursor, and at least one other compatible agent.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">6.</span>
              <span><strong>Handle errors gracefully.</strong> Include fallback instructions for when scripts fail or dependencies are missing.</span>
            </li>
          </ul>
        </div>

        {/* External links */}
        <div className="mt-10 flex flex-wrap gap-6">
          <a
            href="https://agentskills.io/specification"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Full Specification <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://github.com/anthropics/skills"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Example Skills <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            href="/docs/what-are-skills"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            What are Skills? &rarr;
          </Link>
          <Link
            href="/submit"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Submit to marketplace &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
