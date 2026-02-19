'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  text: string
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
