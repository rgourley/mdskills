import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Skill Advisor — How We Review Skills',
  description: 'How the mdskills.ai Skill Advisor evaluates skills, plugins, and MCP servers for capabilities, quality, and security.',
  alternates: { canonical: '/docs/skill-advisor' },
  openGraph: {
    title: 'Skill Advisor — How We Review Skills — mdskills.ai',
    description: 'Our AI-powered review methodology for evaluating agent skills on capabilities, quality, and security.',
    url: '/docs/skill-advisor',
  },
}

export default function SkillAdvisorPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/docs" className="text-sm text-neutral-500 hover:text-neutral-700 mb-8 inline-block">
          &larr; Docs
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">
            Skill Advisor
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            Every skill, plugin, and MCP server on mdskills.ai is reviewed by the Skill Advisor &mdash;
            an AI-powered evaluation that scores listings on capabilities, quality, and security.
            The goal is to help you quickly assess whether a skill is well-built, safe to use,
            and worth installing.
          </p>
        </div>

        <section className="prose-neutral">
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">What we evaluate</h2>
          <p className="text-neutral-600 mb-4">
            The Skill Advisor analyzes the SKILL.md content (and README when available) against three dimensions:
          </p>

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-xl border border-neutral-200 bg-white">
              <h3 className="font-semibold text-neutral-900">1. Capabilities</h3>
              <p className="mt-1 text-sm text-neutral-600">
                What does this skill actually enable an agent to do? Is it useful and well-scoped, or shallow and trivial?
                Are the instructions specific enough that an agent could execute them reliably without guessing?
              </p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 bg-white">
              <h3 className="font-semibold text-neutral-900">2. Quality</h3>
              <p className="mt-1 text-sm text-neutral-600">
                Is the SKILL.md well-structured? Does it have clear trigger conditions, step-by-step instructions,
                examples, and edge case handling? Does it use progressive disclosure? Would an agent or human
                understand exactly what this does out of the box?
              </p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 bg-white">
              <h3 className="font-semibold text-neutral-900">3. Security</h3>
              <p className="mt-1 text-sm text-neutral-600">
                Are the declared permissions appropriate for what the skill actually does? Are there unvalidated
                shell commands, unconstrained file writes, or credential handling concerns? Could a malicious input
                trick an agent into running dangerous commands through this skill?
              </p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">How scoring works</h2>
          <p className="text-neutral-600 mb-4">
            Each skill receives a score from 1 to 10, along with specific strengths and weaknesses.
            The score reflects overall quality across all three dimensions:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse my-4">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 pr-4 font-semibold text-neutral-900">Score</th>
                  <th className="text-left py-2 font-semibold text-neutral-900">Meaning</th>
                </tr>
              </thead>
              <tbody className="text-neutral-600">
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">7</span>
                    <span className="ml-1">- 10</span>
                  </td>
                  <td className="py-2">Strong &mdash; actionable, well-structured, and immediately usable by an agent</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-amber-100 text-amber-700">4</span>
                    <span className="ml-1">- 6</span>
                  </td>
                  <td className="py-2">Decent &mdash; functional but could improve in specificity, examples, or permissions</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-red-100 text-red-700">1</span>
                    <span className="ml-1">- 3</span>
                  </td>
                  <td className="py-2">Weak &mdash; missing actionable instructions or not usable by an agent as-is</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-neutral-600 mb-4">
            Scores of 9 or 10 are rare and reserved for skills that excel in all three dimensions.
            A score of 7 is good. Security concerns &mdash; especially undeclared permissions or
            prompt injection risk &mdash; significantly impact the score.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">What we flag</h2>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 ml-2">
            <li><strong>Permission mismatches</strong> &mdash; a skill that uses shell commands but doesn&apos;t declare shell execution</li>
            <li><strong>Over-scoped permissions</strong> &mdash; requesting filesystem write, shell, and network when only read is needed</li>
            <li><strong>Missing instructions</strong> &mdash; a skill that describes what it does but not how to do it</li>
            <li><strong>No trigger conditions</strong> &mdash; no clear &ldquo;when to use this skill&rdquo; section</li>
            <li><strong>Prompt injection surface</strong> &mdash; instructions that could be exploited by malicious file content</li>
            <li><strong>Credential handling</strong> &mdash; secrets stored in plaintext or passed unsafely</li>
          </ul>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">How reviews are generated</h2>
          <p className="text-neutral-600 mb-4">
            Reviews are generated by Claude (Anthropic&apos;s AI) using a structured evaluation prompt.
            The reviewer analyzes the skill&apos;s SKILL.md content, README, and declared permissions.
            Reviews are generated when a skill is first imported and can be regenerated when the skill
            content is updated.
          </p>
          <p className="text-neutral-600 mb-4">
            The Skill Advisor is not a popularity metric. It doesn&apos;t consider GitHub stars,
            install counts, or community sentiment. It evaluates the skill file itself &mdash;
            its structure, clarity, security posture, and usefulness to an AI agent.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">Limitations</h2>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 ml-2">
            <li>Reviews are AI-generated and may occasionally miss nuances or produce false positives</li>
            <li>The review evaluates the skill file, not the underlying tool or service it wraps</li>
            <li>Security analysis is based on content inspection, not runtime testing</li>
            <li>Scores may vary slightly if a review is regenerated</li>
          </ul>
        </section>

        <div className="mt-12 p-5 rounded-xl bg-blue-50 border border-blue-100 text-sm text-neutral-700">
          <strong>Want to improve your score?</strong> Read the{' '}
          <Link href="/docs/skill-best-practices#security" className="text-blue-600 hover:text-blue-700 font-medium">
            SKILL.md Best Practices
          </Link>{' '}
          guide &mdash; especially the security section on permissions, shell safety, and credential handling.
        </div>

        <div className="mt-6 p-6 rounded-xl bg-neutral-50 border border-neutral-200">
          <h3 className="font-semibold text-neutral-900">Have feedback?</h3>
          <p className="mt-1 text-sm text-neutral-600">
            If you think a review is inaccurate or unfair, let us know. We&apos;re continuously improving
            the evaluation criteria to be more helpful and precise.
          </p>
          <a
            href="https://github.com/rgourley/mdskills/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Open an issue on GitHub &rarr;
          </a>
        </div>
      </div>
    </div>
  )
}
