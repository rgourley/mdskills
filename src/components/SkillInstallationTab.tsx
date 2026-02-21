'use client'

import { useState } from 'react'
import { CopyButton } from '@/components/CopyButton'
import { Monitor, Terminal, Download } from 'lucide-react'
import type { Skill } from '@/lib/skills'
import type { ListingClient } from '@/lib/clients'

interface SkillInstallationTabProps {
  skill: Skill
  installCommand: string
  clients?: ListingClient[]
}

export function SkillInstallationTab({ skill, installCommand, clients }: SkillInstallationTabProps) {
  const [selectedClient, setSelectedClient] = useState<string>(
    clients?.find((c) => c.isPrimary)?.clientSlug ?? clients?.[0]?.clientSlug ?? ''
  )

  const pluginCommand = skill.artifactType === 'plugin'
    ? `/plugin install ${skill.owner}/${skill.repo}`
    : `/plugin marketplace add ${skill.owner}/${skill.slug}`

  // If we have client-specific install instructions, show the dynamic selector
  if (clients && clients.length > 0) {
    const selected = clients.find((c) => c.clientSlug === selectedClient) ?? clients[0]
    return (
      <div className="space-y-6">
        {/* Client selector */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">Select your AI client</h3>
          <div className="flex flex-wrap gap-2">
            {clients.map((client) => (
              <button
                key={client.clientSlug}
                onClick={() => setSelectedClient(client.clientSlug)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${selectedClient === client.clientSlug
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }
                `}
              >
                {client.clientName}
              </button>
            ))}
          </div>
        </div>

        {/* Instructions for selected client */}
        {selected?.installInstructions && (
          <div className="p-4 rounded-xl bg-neutral-900 text-white">
            <div className="flex items-start gap-3">
              <pre className="flex-1 font-mono text-sm whitespace-pre-wrap break-all">
                {selected.installInstructions}
              </pre>
              <CopyButton text={selected.installInstructions} />
            </div>
          </div>
        )}

        {!selected?.installInstructions && (
          <div className="p-4 rounded-xl bg-neutral-100 text-neutral-600 text-sm">
            No specific install instructions for {selected?.clientName} yet. Try the generic command below.
          </div>
        )}

        {/* Generic fallback */}
        <section className="pt-4 border-t border-neutral-200">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">Generic install (all platforms)</h3>
          <div className="p-4 rounded-xl bg-neutral-100">
            <div className="flex items-center gap-3">
              <code className="flex-1 font-mono text-sm break-all">{installCommand}</code>
              <CopyButton text={installCommand} />
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Fallback: original hardcoded instructions (no listing_clients data)
  return (
    <div className="space-y-10">
      {/* Claude Code (full features) */}
      {(skill.hasPlugin || skill.artifactType === 'plugin') && (
        <section>
          <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Claude Code (full features)
          </h3>
          <p className="text-sm text-neutral-600 mb-3">
            Install the plugin for persistent memory, commands, and best experience.
          </p>
          <div className="p-4 rounded-xl bg-neutral-900 text-white space-y-2">
            <div className="flex items-center gap-3">
              <code className="flex-1 font-mono text-sm break-all">{pluginCommand}</code>
              <CopyButton text={pluginCommand} />
            </div>
            <p className="text-xs text-neutral-400">Then run /plugin menu, select the skill, and restart.</p>
          </div>
        </section>
      )}

      {/* All platforms: npx */}
      <section>
        <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
          <Monitor className="w-4 h-4" />
          Cursor, Windsurf, and other agents
        </h3>
        <div className="p-4 rounded-xl bg-neutral-100">
          <div className="flex items-center gap-3">
            <code className="flex-1 font-mono text-sm break-all">{installCommand}</code>
            <CopyButton text={installCommand} />
          </div>
        </div>
      </section>

      {/* Claude.ai Web / Desktop: zip */}
      <section>
        <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Claude.ai Web or Desktop
        </h3>
        <p className="text-sm text-neutral-600 mb-2">
          Download the skill as a file, then: Settings &rarr; Capabilities &rarr; Skills &rarr; Upload.
        </p>
        <p className="text-sm text-neutral-500">
          Use the <strong>Download</strong> button at the top of this page to get SKILL.md, or install via the CLI on supported agents.
        </p>
      </section>
    </div>
  )
}
