'use client'

import Link from 'next/link'
import { useState } from 'react'

interface SkillSourceCodeProps {
  content: string
  filename?: string
  editHref?: string
}

export function SkillSourceCode({ content, filename = 'SKILL.md', editHref }: SkillSourceCodeProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = content.split('\n')

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-100 border-b border-neutral-200">
        <span className="font-mono text-sm text-neutral-700">{filename}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          {editHref && (
            <Link
              href={editHref}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Edit in Browser
            </Link>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-4 font-mono text-sm text-neutral-800 leading-relaxed">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="select-none w-10 shrink-0 pr-4 text-right text-neutral-400">
                {i + 1}
              </span>
              <span className="flex-1">{line || ' '}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}
