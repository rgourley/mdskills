import Link from 'next/link'
import { Star, Layout, Users, BarChart3, Zap, Shield, Mail } from 'lucide-react'
import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Advertise with mdskills.ai',
  description: 'Reach thousands of developers building with AI coding agents. Featured listings and sponsored categories on the largest AI skills marketplace.',
  alternates: { canonical: '/advertise' },
  openGraph: {
    title: 'Advertise with mdskills.ai',
    description: 'Reach developers building with AI coding agents. Featured listings and sponsored categories.',
    url: '/advertise',
  },
}

export default async function AdvertisePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-neutral-900">
            Reach developers building with AI
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            mdskills.ai is the community marketplace where developers discover skills, MCP servers,
            plugins, and tools for Claude Code, Cursor, Codex, and 27+ AI coding agents.
            Put your product in front of the people actively looking for it.
          </p>
        </div>

        {/* Audience stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { value: '1,500+', label: 'Skills & tools listed' },
            { value: '27+', label: 'AI clients supported' },
            { value: '20+', label: 'Use-case categories' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 sm:p-6 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-neutral-900">{stat.value}</div>
              <div className="mt-1 text-xs sm:text-sm text-neutral-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Featured Listings */}
        <div className="mb-8 p-6 sm:p-8 rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">Featured Listings</h2>
              <p className="mt-1 text-neutral-600">
                Get your skill, MCP server, or plugin highlighted across the marketplace.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3">What you get</h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-neutral-900">Featured badge</strong> — gold highlight that stands out in search results and category pages</span>
                </li>
                <li className="flex items-start gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-neutral-900">Priority placement</strong> — appear first in search results and category listings</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-neutral-900">Skill Advisor review</strong> — AI-powered quality review with score, strengths, and improvement suggestions</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3">Great for</h3>
              <p className="text-sm text-neutral-600">
                Companies with MCP servers (Stripe, Supabase, Datadog), developer tool vendors,
                skill authors who want more visibility, and anyone shipping AI integrations.
              </p>
            </div>
          </div>
        </div>

        {/* Sponsored Categories */}
        <div className="mb-12 p-6 sm:p-8 rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
              <Layout className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">Sponsored Categories</h2>
              <p className="mt-1 text-neutral-600">
                Own an entire use-case category and become the go-to brand for that developer workflow.
              </p>
            </div>
          </div>

          <div className="mb-6 p-4 rounded-lg bg-neutral-50 border border-neutral-100">
            <p className="text-sm text-neutral-500 italic">
              Example: &ldquo;Web Development &mdash; powered by Vercel&rdquo; or &ldquo;Database & Backend &mdash; by Supabase&rdquo;
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3">What you get</h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-neutral-900">Brand placement</strong> — your logo and name on the category page, seen by every developer browsing that use case</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-neutral-900">Featured skills</strong> — your tools pinned to the top of the category listing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-neutral-900">Newsletter inclusion</strong> — mention in our weekly digest to subscribers</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3">Great for</h3>
              <p className="text-sm text-neutral-600">
                Platform companies, cloud providers, and developer tool companies who want to
                be the trusted name in a specific developer workflow &mdash; from web development
                to DevOps to data engineering.
              </p>
            </div>
          </div>
        </div>

        {/* Why mdskills.ai */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">Why advertise here</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: Users,
                title: 'Developer-focused audience',
                desc: 'Our visitors are software engineers actively using AI coding tools in their daily workflow. No casual browsers — these are practitioners.',
              },
              {
                icon: Zap,
                title: 'High-intent traffic',
                desc: 'Developers come here looking for specific tools and integrations. They\'re ready to install, not just browsing.',
              },
              {
                icon: BarChart3,
                title: 'Growing ecosystem',
                desc: '1,500+ listings and growing. As AI coding agents become standard, more developers discover mdskills.ai every week.',
              },
              {
                icon: Shield,
                title: 'Clean, non-intrusive placements',
                desc: 'No pop-ups, no interstitials, no data harvesting. Featured listings and sponsored categories feel native to the browsing experience.',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="p-5 rounded-xl border border-neutral-200 bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-4 h-4 text-neutral-400" />
                    <h3 className="font-semibold text-neutral-900 text-sm">{item.title}</h3>
                  </div>
                  <p className="text-sm text-neutral-600">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 sm:p-8 rounded-xl bg-blue-50 border border-blue-100 text-center">
          <h2 className="text-xl font-semibold text-neutral-900">Get in touch</h2>
          <p className="mt-2 text-neutral-600 max-w-lg mx-auto">
            Interested in a featured listing, sponsored category, or a custom partnership?
            We&rsquo;d love to hear from you.
          </p>
          <a
            href="mailto:rgourley@gmail.com?subject=Advertising%20on%20mdskills.ai"
            className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Contact us
          </a>
          <p className="mt-3 text-xs text-neutral-500">
            We also offer custom packages &mdash; let us know what you have in mind.
          </p>
        </div>

        {/* Back link */}
        <div className="mt-12 text-center">
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
            &larr; Back to mdskills.ai
          </Link>
        </div>
      </div>
    </div>
  )
}
