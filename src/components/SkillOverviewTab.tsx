import Link from 'next/link'
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

/** Render markdown-ish content as styled HTML (headings, code blocks, lists, paragraphs) */
function SkillContent({ content }: { content: string }) {
  const lines = stripFrontmatter(content).split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code blocks
    if (line.startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      elements.push(
        <pre key={`code-${i}`} className="p-4 rounded-lg bg-neutral-900 text-white text-sm font-mono overflow-x-auto my-4">
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
      continue
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(<h4 key={`h4-${i}`} className="text-base font-semibold text-neutral-900 mt-6 mb-2">{line.slice(4)}</h4>)
      i++
      continue
    }
    if (line.startsWith('## ')) {
      elements.push(<h3 key={`h3-${i}`} className="text-lg font-semibold text-neutral-900 mt-8 mb-3">{line.slice(3)}</h3>)
      i++
      continue
    }
    if (line.startsWith('# ')) {
      // Skip the top-level heading (it's already the page title)
      i++
      continue
    }

    // List items
    if (line.match(/^[-*] /)) {
      const listItems: string[] = []
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        listItems.push(lines[i].replace(/^[-*] /, ''))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-1 text-neutral-600 my-2">
          {listItems.map((item, j) => <li key={j}>{item}</li>)}
        </ul>
      )
      continue
    }

    // Numbered list items
    if (line.match(/^\d+\. /)) {
      const listItems: string[] = []
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        listItems.push(lines[i].replace(/^\d+\. /, ''))
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside space-y-1 text-neutral-600 my-2">
          {listItems.map((item, j) => <li key={j}>{item}</li>)}
        </ol>
      )
      continue
    }

    // Empty lines
    if (line.trim() === '') {
      i++
      continue
    }

    // Regular paragraphs
    elements.push(<p key={`p-${i}`} className="text-neutral-600 leading-relaxed my-2">{line}</p>)
    i++
  }

  return <div>{elements}</div>
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

      {/* Skill content / README */}
      {skill.skillContent && (
        <section>
          <SkillContent content={skill.skillContent} />
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
