'use client'

const AGENTS = [
  { name: 'Claude', initial: 'C', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { name: 'OpenAI', initial: 'O', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { name: 'Codex', initial: 'X', color: 'bg-violet-100 text-violet-800 border-violet-200' },
  { name: 'Cursor', initial: 'Cu', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  { name: 'Gemini', initial: 'G', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { name: 'Copilot', initial: 'Co', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { name: 'Replit', initial: 'R', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { name: 'Windsurf', initial: 'W', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { name: 'Continue', initial: 'Cn', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  { name: 'Aider', initial: 'A', color: 'bg-rose-100 text-rose-800 border-rose-200' },
]

export function AgentStrip() {
  return (
    <div className="mt-8">
      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
        Works with
      </p>
      <div className="flex flex-wrap gap-2">
        {AGENTS.map((agent) => (
          <span
            key={agent.name}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${agent.color}`}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/60 text-[10px] font-bold">
              {agent.initial}
            </span>
            {agent.name}
          </span>
        ))}
      </div>
    </div>
  )
}
