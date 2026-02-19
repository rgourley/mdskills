import Link from 'next/link'
import { getClients } from '@/lib/clients'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Agents & Clients',
  description: 'Browse 27+ AI agents and tools that support SKILL.md. See compatible skills for Claude Code, Cursor, Codex, Gemini CLI, VS Code, Windsurf, and more.',
  alternates: { canonical: '/clients' },
  openGraph: {
    title: 'AI Agents & Clients — mdskills.ai',
    description: 'Browse 27+ AI agents and tools that support SKILL.md. See compatible skills for Claude Code, Cursor, Codex, Gemini CLI, VS Code, Windsurf, and more.',
    url: '/clients',
  },
}

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">AI Clients</h1>
          <p className="mt-2 text-neutral-600">
            Browse compatible AI tools. See what works with each client and how to install.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.slug}`}
              className="group block p-6 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-200 transition-colors">
                  <span className="text-sm font-bold text-neutral-600">
                    {client.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                    {client.name}
                  </h3>
                </div>
              </div>
              {client.websiteUrl && (
                <div className="mt-3 flex items-center gap-1 text-xs text-neutral-500">
                  <ExternalLink className="w-3 h-3" />
                  <span className="truncate">{client.websiteUrl.replace('https://', '')}</span>
                </div>
              )}
            </Link>
          ))}
        </div>

        {clients.length === 0 && (
          <p className="text-neutral-500 py-12 text-center">
            No clients available yet.
          </p>
        )}
      </div>
    </div>
  )
}
