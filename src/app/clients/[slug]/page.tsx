import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createApiClient } from '@/lib/supabase/api'
import { getClientBySlug } from '@/lib/clients'
import { getSkills } from '@/lib/skills'
import { SkillCard } from '@/components/SkillCard'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateStaticParams() {
  const supabase = createApiClient()
  if (!supabase) return []
  const { data } = await supabase
    .from('clients')
    .select('slug')
  return (data ?? []).map(({ slug }) => ({ slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const client = await getClientBySlug(slug)
  if (!client) return { title: 'Client Not Found' }

  const title = `${client.name} — AI Agent Skills`
  const description = `Browse AI agent skills compatible with ${client.name}. Find and install SKILL.md files, MCP servers, and workflows for ${client.name}.`

  return {
    title,
    description,
    alternates: { canonical: `/clients/${slug}` },
    openGraph: {
      title: `${client.name} Skills — mdskills.ai`,
      description,
      url: `/clients/${slug}`,
    },
    keywords: [client.name, 'AI skills', 'SKILL.md', 'agent skills', slug],
  }
}

/** Map of which artifact types each client generally supports */
const CLIENT_CAPABILITIES: Record<string, string[]> = {
  'claude-code': ['Agent Skills', 'MCP Servers', 'Rules', 'Workflow Packs'],
  'claude-desktop': ['MCP Servers', 'Agent Skills'],
  'cursor': ['Agent Skills', 'Rules', 'MCP Servers'],
  'vscode-copilot': ['Extensions', 'Agent Skills'],
  'chatgpt': ['OpenAPI Actions', 'Workflow Packs'],
  'gemini': ['Workflow Packs', 'Agent Skills'],
  'windsurf': ['Agent Skills', 'Rules', 'MCP Servers'],
  'continue-dev': ['Agent Skills', 'MCP Servers'],
  'codex': ['Agent Skills', 'Workflow Packs'],
  'grok': ['Workflow Packs'],
  'replit': ['Agent Skills', 'Workflow Packs'],
  // New clients from agentskills.io ecosystem
  'gemini-cli': ['Agent Skills', 'MCP Servers'],
  'amp': ['Agent Skills', 'MCP Servers'],
  'roo-code': ['Agent Skills', 'Rules', 'MCP Servers'],
  'goose': ['Agent Skills', 'MCP Servers'],
  'github': ['Agent Skills'],
  'vscode': ['Extensions', 'Agent Skills'],
  'opencode': ['Agent Skills'],
  'firebender': ['Agent Skills'],
  'letta': ['Agent Skills'],
  'factory': ['Agent Skills'],
  'trae': ['Agent Skills', 'Rules'],
  'spring-ai': ['Agent Skills'],
  'qodo': ['Agent Skills'],
  'databricks': ['Agent Skills'],
  'agentman': ['Agent Skills'],
  'command-code': ['Agent Skills'],
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { slug } = await params
  const client = await getClientBySlug(slug)
  if (!client) notFound()

  const { skills } = await getSkills({ clientSlug: slug })
  const capabilities = CLIENT_CAPABILITIES[slug] ?? ['Skill Packs']

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link
          href="/clients"
          className="text-sm text-neutral-500 hover:text-neutral-700 mb-8 inline-block"
        >
          &larr; All clients
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-neutral-100 flex items-center justify-center">
              <span className="text-xl font-bold text-neutral-600">
                {client.name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">{client.name}</h1>
              {client.websiteUrl && (
                <a
                  href={client.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  {client.websiteUrl.replace('https://', '')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Supported Types */}
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">Supported Artifact Types</h2>
          <div className="flex flex-wrap gap-2">
            {capabilities.map((cap) => (
              <span
                key={cap}
                className="px-3 py-1 rounded-full bg-neutral-100 text-sm text-neutral-700"
              >
                {cap}
              </span>
            ))}
          </div>
        </section>

        {/* Compatible Listings */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Compatible Listings
            </h2>
            {skills.length > 0 && (
              <Link
                href={`/skills?client=${slug}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                View all in Explore &rarr;
              </Link>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-neutral-500">
                  No listings linked to {client.name} yet.
                </p>
                <p className="mt-2 text-sm text-neutral-400">
                  Listings will appear here as authors add compatibility information.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
