'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CopyButton } from '@/components/CopyButton'
import { Download, Terminal, GitFork, Share2, ShoppingCart, Loader2 } from 'lucide-react'
import { VoteButton } from './VoteButton'
import type { Skill } from '@/lib/skills'

interface SkillActionsProps {
  skill: Skill
  installCommand: string
  isPurchased?: boolean
  isCreator?: boolean
}

export function SkillActions({ skill, installCommand, isPurchased, isCreator }: SkillActionsProps) {
  const [purchasing, setPurchasing] = useState(false)
  const shareTitle = `${skill.name} - mdskills.ai`

  const isPaidSkill = skill.isPaid && skill.priceAmount
  const hasAccess = !isPaidSkill || isPurchased || isCreator

  // For plugins/full repos, download zip from GitHub; for standalone skills, download SKILL.md
  const freeDownloadUrl = !isPaidSkill && skill.owner && skill.repo
    ? `https://github.com/${skill.owner}/${skill.repo}/archive/refs/heads/main.zip`
    : null

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
  }

  const handlePurchase = async () => {
    setPurchasing(true)
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'begin_checkout', {
          event_category: 'purchase',
          event_label: skill.slug,
          value: (skill.priceAmount || 0) / 100,
          currency: 'USD',
        })
      }

      const res = await fetch(`/api/skills/${skill.slug}/purchase`, {
        method: 'POST',
      })
      const data = await res.json()

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      } else {
        alert(data.error || 'Failed to start checkout')
        setPurchasing(false)
      }
    } catch {
      alert('Something went wrong. Please try again.')
      setPurchasing(false)
    }
  }

  const handleDownload = async () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'download_skill', {
        event_category: 'engagement',
        event_label: skill.slug,
        skill_name: skill.name,
        artifact_type: skill.artifactType,
      })
    }

    // Paid skill download — get signed URL from API
    if (isPaidSkill && hasAccess) {
      try {
        const res = await fetch(`/api/skills/${skill.slug}/download`)
        const data = await res.json()
        if (data.downloadUrl) {
          window.location.href = data.downloadUrl
        } else {
          alert(data.error || 'Download failed')
        }
      } catch {
        alert('Download failed. Please try again.')
      }
      return
    }

    // Free skill download
    if (freeDownloadUrl) {
      window.location.href = freeDownloadUrl
      return
    }
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
    if (window.gtag) {
      window.gtag('event', 'share_skill', {
        event_category: 'engagement',
        event_label: skill.slug,
        method: typeof navigator.share === 'function' ? 'native' : 'clipboard',
      })
    }
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
      {/* Paid skill — not purchased: show buy button */}
      {isPaidSkill && !hasAccess && (
        <div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium transition-colors w-full sm:w-auto"
            >
              {purchasing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting to checkout...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Buy for {formatPrice(skill.priceAmount!)}
                </>
              )}
            </button>
          </div>
          <p className="mt-2 text-sm text-neutral-500">
            One-time purchase · Instant download access
          </p>
        </div>
      )}

      {/* Free skill or purchased/creator — show install + download */}
      {hasAccess && (
        <div>
          <p className="text-sm font-medium text-neutral-700 mb-3">
            {isPaidSkill ? (isPurchased ? 'You own this skill' : 'Your skill') : 'Add this skill'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {!isPaidSkill && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-code-bg border border-neutral-200 text-neutral-800 sm:w-[70%]">
                <Terminal className="w-4 h-4 shrink-0" />
                <code className="text-sm font-mono truncate flex-1 min-w-0">{installCommand}</code>
                <CopyButton text={installCommand} eventLabel={skill.slug} />
              </div>
            )}
            <button
              onClick={handleDownload}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors ${isPaidSkill ? 'w-full sm:w-auto' : 'sm:w-[30%]'}`}
            >
              <Download className="w-4 h-4 shrink-0" />
              Download
            </button>
          </div>
        </div>
      )}

      {/* Other actions */}
      <div className="flex flex-wrap gap-3">
        {!isPaidSkill && (
          <Link
            href={`/create?fork=${skill.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <GitFork className="w-4 h-4" />
            Fork & Edit
          </Link>
        )}
        <VoteButton skillId={skill.id} initialCount={skill.upvotes ?? 0} />
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
