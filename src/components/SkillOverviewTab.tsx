import Link from 'next/link'
import { CopyButton } from '@/components/CopyButton'
import { Tag, Monitor } from 'lucide-react'
import type { Skill } from '@/lib/skills'

interface SkillOverviewTabProps {
  skill: Skill
  installCommand: string
}

export function SkillOverviewTab({ skill, installCommand }: SkillOverviewTabProps) {
  return (
    <div className="space-y-10">
      {/* Quick Start */}
      <section>
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">Quick Start</h3>
        <div className="p-6 rounded-xl bg-neutral-900 text-white">
          <p className="text-sm font-medium text-neutral-300 mb-3">Install via CLI</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 font-mono text-sm break-all">{installCommand}</code>
            <CopyButton text={installCommand} />
          </div>
        </div>
      </section>

      {/* What this skill does */}
      <section>
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">What this skill does</h3>
        <p className="text-neutral-600 leading-relaxed">{skill.description}</p>
      </section>

      {/* Tags & Platforms */}
      <section className="flex flex-wrap gap-8">
        {skill.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-neutral-500 flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4" /> Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {skill.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/skills?tag=${tag}`}
                  className="px-3 py-1 rounded-full bg-neutral-100 text-sm text-neutral-700 hover:bg-neutral-200 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}
        {skill.platforms.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-neutral-500 flex items-center gap-2 mb-2">
              <Monitor className="w-4 h-4" /> Platforms
            </h3>
            <div className="flex flex-wrap gap-2">
              {skill.platforms.map((platform) => (
                <span
                  key={platform}
                  className="px-3 py-1 rounded-full bg-neutral-100 text-sm text-neutral-600"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Metadata */}
      <section className="text-sm text-neutral-500">
        {skill.updatedAt && <span>Updated {skill.updatedAt}</span>}
        {skill.owner && (
          <>
            <span className="mx-2">·</span>
            <a
              href={`https://github.com/${skill.owner}/${skill.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              View source on GitHub
            </a>
          </>
        )}
      </section>
    </div>
  )
}
