'use client'

import Image from 'next/image'

const AGENTS = [
  { name: 'Claude', src: '/images/claude-logo_svgstack_com_36971770938345.svg' },
  { name: 'ChatGPT', src: '/images/chatgpt-app-logo_svgstack_com_36951770938383.svg' },
  { name: 'Cursor', src: '/images/cursor-logo_svgstack_com_68891770938472.svg' },
  { name: 'Gemini', src: '/images/gemini-logo_svgstack_com_37141770938404.svg' },
  { name: 'Grok', src: '/images/grok-ai-logo_svgstack_com_37221770938454.svg' },
  { name: 'Copilot', src: '/images/microsoft-copilot-logo_svgstack_com_28111770938394.svg' },
  { name: 'Replit', src: '/images/replit-logo_svgstack_com_51341770938490.svg' },
]

const LOGO_SIZE = 24

export function AgentStrip() {
  return (
    <div className="mt-8">
      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
        Works with
      </p>
      <div className="flex flex-wrap items-center gap-4">
        {AGENTS.map((agent) => (
          <Image
            key={agent.name}
            src={agent.src}
            alt={agent.name}
            width={LOGO_SIZE}
            height={LOGO_SIZE}
            className="h-6 w-6 shrink-0 object-contain"
            title={agent.name}
          />
        ))}
      </div>
    </div>
  )
}
