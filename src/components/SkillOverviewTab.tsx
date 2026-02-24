import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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

/** Convert GitHub-style admonitions (> [!NOTE], > [!IMPORTANT], etc.) into styled blockquotes */
function convertAdmonitions(content: string): string {
  const LABELS: Record<string, string> = {
    NOTE: 'Note',
    TIP: 'Tip',
    IMPORTANT: 'Important',
    WARNING: 'Warning',
    CAUTION: 'Caution',
  }
  return content.replace(
    /^(>\s*)\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n/gim,
    (_, prefix, type) => `${prefix}**${LABELS[type.toUpperCase()] || type}:**\n${prefix}\n`
  )
}

/** Strip HTML tags from content (e.g. <p align="center">) but preserve images */
function stripHtml(content: string): string {
  return content
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Convert HTML <img> to markdown ![alt](src) before stripping other tags
    .replace(/<img\s+[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    .replace(/<img\s+[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)')
    .replace(/<img\s+[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)')
    .replace(/<[^>]+>/g, '')
}

/** Check if a URL is a badge/shield image (shields.io, badge.fury.io, etc.) */
const BADGE_PATTERNS = [
  /img\.shields\.io/i,
  /badge\.fury\.io/i,
  /badgen\.net/i,
  /badges\.gitter\.im/i,
  /pypistats\.org/i,
  /coveralls\.io\/repos/i,
  /codecov\.io/i,
  /travis-ci\.(org|com)/i,
  /circleci\.com/i,
  /github\.com\/[^/]+\/[^/]+\/(actions\/)?workflows\/.*badge/i,
  /github\.com\/[^/]+\/[^/]+\/badge/i,
  /app\.codacy\.com\/project\/badge/i,
  /snyk\.io\/test/i,
  /david-dm\.org/i,
  /flat\.badgen\.net/i,
]

/** Junk image patterns — contributor avatars, sponsor logos, etc. */
const JUNK_IMAGE_PATTERNS = [
  /avatars\.githubusercontent\.com/i,
  /contributors-img/i,
  /contrib\.rocks/i,
  /opencollective\.com\/.*\/avatar/i,
  /opencollective\.com\/.*\/sponsor/i,
  /buymeacoffee\.com/i,
  /ko-fi\.com/i,
  /patreon\.com/i,
  /sponsor/i,
  /\.gif$/i,  // Animated GIFs are often decorative
]

function isBadgeUrl(src: string): boolean {
  return BADGE_PATTERNS.some(pattern => pattern.test(src))
}

function isJunkImage(src: string): boolean {
  return JUNK_IMAGE_PATTERNS.some(pattern => pattern.test(src))
}

/** Max number of content images to render from a README */
const MAX_README_IMAGES = 5

/** Resolve a relative image URL to an absolute GitHub raw content URL */
function resolveImageUrl(src: string, owner: string, repo: string): string {
  if (!src || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//') || src.startsWith('data:')) {
    return src
  }
  // Strip leading ./ if present
  const cleaned = src.replace(/^\.\//, '')
  return `https://raw.githubusercontent.com/${owner}/${repo}/main/${cleaned}`
}

/** Render markdown content with react-markdown, resolving relative image URLs */
function SkillContent({ content, owner, repo }: { content: string; owner: string; repo: string }) {
  const cleaned = convertAdmonitions(stripHtml(stripFrontmatter(content)))
  let imageCount = 0

  return (
    <div className="prose prose-neutral max-w-none prose-headings:text-neutral-900 prose-p:text-neutral-600 prose-li:text-neutral-600 prose-strong:text-neutral-800 prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-code:text-neutral-700 prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-code:font-medium prose-code:before:content-none prose-code:after:content-none prose-pre:bg-code-bg prose-pre:text-neutral-800 prose-pre:rounded-lg prose-pre:border prose-pre:border-neutral-200 prose-hr:border-neutral-200 prose-th:text-neutral-700 prose-td:text-neutral-600 prose-img:rounded-lg">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt, ...props }) => {
            // Strip badge/shield images (shields.io, badge.fury.io, etc.)
            if (src && isBadgeUrl(src)) return null
            // Strip junk images (contributor avatars, sponsor logos, GIFs, etc.)
            if (src && isJunkImage(src)) return null
            // Cap total images to avoid README clutter at the bottom
            if (imageCount >= MAX_README_IMAGES) return null
            imageCount++
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveImageUrl(src || '', owner, repo)}
                alt={alt || ''}
                loading="lazy"
                {...props}
              />
            )
          },
        }}
      >
        {cleaned}
      </ReactMarkdown>
    </div>
  )
}

export function SkillOverviewTab({ skill, installCommand }: SkillOverviewTabProps) {
  const pluginCommand = skill.hasPlugin ? `/plugin marketplace add ${skill.owner}/${skill.slug}` : null

  return (
    <div className="space-y-10">
      {/* Quick Start */}
      <section>
        <h2 className="text-sm font-semibold text-neutral-900 mb-3">Quick Start</h2>
        {skill.hasPlugin && pluginCommand && (
          <>
            <p className="text-sm font-medium text-neutral-700 mb-2">Best experience: Claude Code</p>
            <div className="p-4 rounded-xl bg-code-bg border border-neutral-200 mb-4">
              <div className="flex items-center gap-3">
                <code className="flex-1 font-mono text-sm text-neutral-800 break-all">{pluginCommand}</code>
                <CopyButton text={pluginCommand} />
              </div>
              <p className="text-xs text-neutral-500 mt-2">Then /plugin menu → select skill → restart. Use /skill-name:init for first-time setup.</p>
            </div>
            <p className="text-sm font-medium text-neutral-700 mb-2">Other platforms</p>
          </>
        )}
        <div className="p-6 rounded-xl bg-code-bg border border-neutral-200">
          <p className="text-sm font-medium text-neutral-500 mb-3">Install via CLI</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 font-mono text-sm text-neutral-800 break-all">{installCommand}</code>
            <CopyButton text={installCommand} />
          </div>
        </div>
      </section>

      {/* README (project overview, installation, how it works) */}
      {(skill.readme || skill.skillContent) && (
        <section>
          <SkillContent content={skill.readme || skill.skillContent!} owner={skill.owner} repo={skill.repo} />
        </section>
      )}

      {/* Tags & Platforms */}
      <section className="flex flex-wrap gap-8">
        {skill.tags.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-neutral-500 flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4" /> Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {skill.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
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
            <h2 className="text-sm font-medium text-neutral-500 flex items-center gap-2 mb-2">
              <Monitor className="w-4 h-4" /> Platforms
            </h2>
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

      {/* FAQ — visible content matching FAQPage structured data for SEO */}
      <section className="border-t border-neutral-200 pt-10">
        <h2 className="text-lg font-semibold text-neutral-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-neutral-900">What is {skill.name}?</h3>
            <p className="mt-1 text-neutral-600">
              {skill.name} is a free, open-source AI agent skill. {skill.description}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-neutral-900">How do I install {skill.name}?</h3>
            <p className="mt-1 text-neutral-600">
              Install {skill.name} with a single command:
            </p>
            <div className="mt-2 p-3 rounded-lg bg-code-bg border border-neutral-200">
              <code className="font-mono text-sm text-neutral-800">{installCommand}</code>
            </div>
            <p className="mt-2 text-neutral-600">
              This downloads the skill files into your project and your AI agent picks them up automatically.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-neutral-900">What platforms support {skill.name}?</h3>
            <p className="mt-1 text-neutral-600">
              {skill.name} works with{' '}
              {skill.platforms.length > 0
                ? skill.platforms
                    .map(p => p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
                    .join(', ')
                : 'Claude Code and other AI agents'}
              . Skills use the open SKILL.md format which is compatible with any AI coding agent that reads markdown instructions.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
