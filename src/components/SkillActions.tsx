'use client'

import Link from 'next/link'
import { CopyButton } from '@/components/CopyButton'
import { Download, GitFork, ThumbsUp, Share2 } from 'lucide-react'
import type { Skill } from '@/lib/skills'

interface SkillActionsProps {
  skill: Skill
  installCommand: string
}

export function SkillActions({ skill, installCommand }: SkillActionsProps) {
  const shareTitle = `${skill.name} - mdskills.ai`

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
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-neutral-900 text-white">
        <Download className="w-4 h-4 shrink-0" />
        <code className="text-sm font-mono break-all">{installCommand}</code>
        <CopyButton text={installCommand} />
      </div>
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
  )
}
