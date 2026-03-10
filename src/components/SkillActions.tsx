'use client'

import { Link } from '@/i18n/navigation'
import { useState, useRef, useEffect } from 'react'
import { CopyButton } from '@/components/CopyButton'
import { Download, Terminal, GitFork, Share2, ShoppingCart, Loader2, Link2, Check } from 'lucide-react'
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

  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shareOpen) return
    const handleClick = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [shareOpen])

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const trackShare = (method: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share_skill', {
        event_category: 'engagement',
        event_label: skill.slug,
        method,
      })
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    trackShare('clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOptions = [
    {
      label: copied ? 'Copied!' : 'Copy link',
      icon: copied ? Check : Link2,
      onClick: handleCopyLink,
    },
    {
      label: 'X / Twitter',
      icon: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
      onClick: () => {
        trackShare('twitter')
        window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
      },
    },
    {
      label: 'LinkedIn',
      icon: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
      onClick: () => {
        trackShare('linkedin')
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')
      },
    },
    {
      label: 'Reddit',
      icon: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" /></svg>,
      onClick: () => {
        trackShare('reddit')
        window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`, '_blank')
      },
    },
  ]

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
        <div className="relative" ref={shareRef}>
          <button
            onClick={() => setShareOpen(!shareOpen)}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          {shareOpen && (
            <div className="absolute bottom-full mb-2 left-0 w-48 py-1 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
              {shareOptions.map((opt) => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.label}
                    onClick={() => {
                      opt.onClick()
                      if (opt.label !== 'Copied!' && opt.label !== 'Copy link') setShareOpen(false)
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-neutral-500" />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
