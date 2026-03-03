import Link from 'next/link'
import { SubmitForm } from './SubmitForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit a Listing',
  description: 'Share your AI agent skill, MCP server, plugin, or ruleset with the open skills ecosystem on mdskills.ai.',
  alternates: { canonical: '/submit' },
  openGraph: {
    title: 'Submit a Listing | mdskills.ai',
    description: 'Share your AI agent skill, MCP server, plugin, or ruleset with the ecosystem.',
    url: '/submit',
  },
}

export default function SubmitPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Submit a Listing</h1>
          <p className="mt-2 text-neutral-600">
            Share your AI capability with the ecosystem. Submit a{' '}
            <Link href="/docs/what-are-skills" className="text-blue-600 hover:underline font-medium">
              SKILL.md
            </Link>
            , MCP server, plugin, ruleset, or tool.
          </p>
        </div>

        <SubmitForm />
      </div>
    </div>
  )
}
