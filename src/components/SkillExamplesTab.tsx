import { ExternalLink } from 'lucide-react'
import type { Skill } from '@/lib/skills'

interface SkillExamplesTabProps {
  skill: Skill
}

export function SkillExamplesTab({ skill }: SkillExamplesTabProps) {
  const examplesUrl = skill.repo && skill.owner
    ? `https://github.com/${skill.owner}/${skill.repo}#examples`
    : null

  return (
    <div className="space-y-8">
      <p className="text-neutral-600">
        {skill.hasExamples
          ? 'This skill includes example workflows and reference files in the repository.'
          : 'Examples and reference files may be available in the repository.'}
      </p>

      {examplesUrl && (
        <div className="p-6 rounded-xl border border-neutral-200 bg-neutral-50">
          <h3 className="text-sm font-semibold text-neutral-900 mb-2">Repository & examples</h3>
          <p className="text-sm text-neutral-600 mb-4">
            Browse the repo for example configs, sample outputs, and usage patterns.
          </p>
          <a
            href={skill.githubUrl || examplesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View on GitHub
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      <section>
        <h3 className="text-sm font-semibold text-neutral-900 mb-2">Quick workflow</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-600">
          <li>Install the skill (use the command at the top of this page).</li>
          <li>In your agent, describe what you want to build or automate.</li>
          <li>Follow any init or setup command the skill provides (e.g. /skill-name:init for plugins).</li>
          <li>Iterate with the agent; the skill keeps behavior consistent across sessions where supported.</li>
        </ol>
      </section>
    </div>
  )
}
