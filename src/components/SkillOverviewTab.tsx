import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { CopyButton } from '@/components/CopyButton'
import { Tag, Monitor, Terminal } from 'lucide-react'
import type { Skill } from '@/lib/skills'

interface SkillOverviewTabProps {
  skill: Skill
  installCommand: string
}

/** Strip YAML frontmatter (---\n...\n---) from content */
function stripFrontmatter(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n?/, '').trim()
}

/** Strip HTML tags from content (e.g. <p align="center">) and convert to plain text */
function stripHtml(content: string): string {
  return content
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<[^>]+>/g, '')
}

/** Render markdown content with react-markdown */
function SkillContent({ content }: { content: string }) {
  const cleaned = stripHtml(stripFrontmatter(content))

  return (
    <div className="prose prose-neutral max-w-none prose-headings:text-neutral-900 prose-p:text-neutral-600 prose-li:text-neutral-600 prose-strong:text-neutral-800 prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-code:text-neutral-800 prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-neutral-900 prose-pre:text-white prose-hr:border-neutral-200 prose-th:text-neutral-700 prose-td:text-neutral-600 prose-img:rounded-lg">
      <ReactMarkdown>{cleaned}</ReactMarkdown>
    </div>
  )
}

export function SkillOverviewTab({ skill, installCommand }: SkillOverviewTabProps) {
  const pluginCommand = skill.hasPlugin ? `/plugin marketplace add ${skill.owner}/${skill.slug}` : null

  return (
    <div className="space-y-10">
      {/* Quick Start */}
      <section>
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">Quick Start</h3>
        {skill.hasPlugin && pluginCommand && (
          <>
            <p className="text-sm font-medium text-neutral-700 mb-2">Best experience: Claude Code</p>
            <div className="p-4 rounded-xl bg-neutral-900 text-white mb-4">
              <div className="flex items-center gap-3">
                <code className="flex-1 font-mono text-sm break-all">{pluginCommand}</code>
                <CopyButton text={pluginCommand} />
              </div>
              <p className="text-xs text-neutral-400 mt-2">Then /plugin menu → select skill → restart. Use /skill-name:init for first-time setup.</p>
            </div>
            <p className="text-sm font-medium text-neutral-700 mb-2">Other platforms</p>
          </>
        )}
        <div className="p-6 rounded-xl bg-neutral-900 text-white">
          <p className="text-sm font-medium text-neutral-300 mb-3">Install via CLI</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 font-mono text-sm break-all">{installCommand}</code>
            <CopyButton text={installCommand} />
          </div>
        </div>
      </section>

      {/* README (project overview, installation, how it works) */}
      {(skill.readme || skill.skillContent) && (
        <section>
          <SkillContent content={skill.readme || skill.skillContent!} />
        </section>
      )}

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
