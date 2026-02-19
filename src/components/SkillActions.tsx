'use client'

import Link from 'next/link'
import { CopyButton } from '@/components/CopyButton'
import { Download, Terminal, GitFork, ThumbsUp, Share2 } from 'lucide-react'
import type { Skill } from '@/lib/skills'

interface SkillActionsProps {
  skill: Skill
  installCommand: string
}

export function SkillActions({ skill, installCommand }: SkillActionsProps) {
  const shareTitle = `${skill.name} - mdskills.ai`

  const handleDownload = () => {
    const content = skill.skillContent ?? `# ${skill.name}\n\n${skill.description}`
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'SKILL.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    if (navigator.share) {
      await navigator.share({
        title: shareTitle,
        url: shareUrl,
        text: skill.description,
      })
    } else {
      await navigator.clipboard.writeText(shareUrl)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add this skill */}
      <div>
        <p className="text-sm font-medium text-neutral-700 mb-3">Add this skill</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
          >
            <Download className="w-4 h-4 shrink-0" />
            Download SKILL.md
          </button>
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#f6f8fa] border border-neutral-200 text-neutral-800">
            <Terminal className="w-4 h-4 shrink-0" />
            <code className="text-sm font-mono truncate flex-1 min-w-0">{installCommand}</code>
            <CopyButton text={installCommand} />
          </div>
        </div>
      </div>

      {/* Other actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/create?fork=${skill.slug}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <GitFork className="w-4 h-4" />
          Fork & Edit
        </Link>
        <button
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
          title="Upvote (coming soon)"
        >
          <ThumbsUp className="w-4 h-4" />
          Upvote
        </button>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  )
}
