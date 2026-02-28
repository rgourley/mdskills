'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

interface CopyButtonProps {
  text: string
  /** Optional GA event label (e.g. skill slug) for tracking install command copies */
  eventLabel?: string
}

export function CopyButton({ text, eventLabel }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    if (eventLabel && window.gtag) {
      window.gtag('event', 'copy_install_command', {
        event_category: 'engagement',
        event_label: eventLabel,
        value: text,
      })
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex-shrink-0 p-2 rounded-lg hover:bg-neutral-200/60 text-neutral-500 hover:text-neutral-700 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-5 h-5 text-green-600" />
      ) : (
        <Copy className="w-5 h-5" />
      )}
    </button>
  )
}
