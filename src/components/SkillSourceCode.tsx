'use client'

import { Link } from '@/i18n/navigation'
import { useState } from 'react'
import { Lock } from 'lucide-react'

interface SkillSourceCodeProps {
  content: string
  filename?: string
  editHref?: string
  isPaid?: boolean
  isLocked?: boolean
  priceAmount?: number
}

export function SkillSourceCode({ content, filename = 'SKILL.md', editHref, isPaid, isLocked, priceAmount }: SkillSourceCodeProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (isLocked) return
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // For locked paid skills, show a placeholder
  const displayContent = isLocked
    ? '# This is a paid skill\n\n# Purchase to view the full source code\n#\n# The source code is available after purchase.\n# You will get immediate download access.\n#\n# ...\n# ...\n# ...\n# ...\n# ...'
    : content
  const lines = displayContent.split('\n')

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden relative">
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-100 border-b border-neutral-200">
        <span className="font-mono text-sm text-neutral-700">{filename}</span>
        <div className="flex items-center gap-2">
          {!isLocked && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
          {editHref && !isLocked && (
            <Link
              href={editHref}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Edit in Browser
            </Link>
          )}
          {isLocked && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg">
              <Lock className="w-3.5 h-3.5" />
              Paid
            </span>
          )}
        </div>
      </div>
      <div className="overflow-x-auto relative">
        <pre className={`p-4 font-mono text-sm text-neutral-800 leading-relaxed ${isLocked ? 'blur-sm select-none' : ''}`}>
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="select-none w-10 shrink-0 pr-4 text-right text-neutral-400">
                {i + 1}
              </span>
              <span className="flex-1">{line || ' '}</span>
            </div>
          ))}
        </pre>
        {/* Locked overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-50/80">
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white border border-neutral-200 shadow-sm">
              <Lock className="w-8 h-8 text-neutral-400" />
              <p className="text-sm font-medium text-neutral-700">Purchase to view source</p>
              {priceAmount && (
                <p className="text-xs text-neutral-500">
                  {formatPrice(priceAmount)} · One-time purchase
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
