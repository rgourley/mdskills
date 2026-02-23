/** JSON-LD structured data components for SEO */

const SITE_URL = 'https://www.mdskills.ai'

interface JsonLdProps {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/** Organization schema for the site */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'mdskills.ai',
        url: SITE_URL,
        description: 'The open skills marketplace for AI agents. Discover, create, fork, and share SKILL.md files.',
        sameAs: ['https://github.com/rgourley/mdskills'],
      }}
    />
  )
}

/** WebSite schema with search action */
export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'mdskills.ai',
        url: SITE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/skills?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  )
}

/** SoftwareApplication + SoftwareSourceCode schema for individual skills */
export function SkillJsonLd({
  name,
  description,
  url,
  author,
  license,
  category,
  platforms,
  githubUrl,
  dateModified,
  datePublished,
  tags,
  reviewScore,
  reviewSummary,
  reviewDate,
}: {
  name: string
  description: string
  url: string
  author: string
  license?: string
  category?: string
  platforms?: string[]
  githubUrl?: string
  dateModified?: string
  datePublished?: string
  tags?: string[]
  reviewScore?: number
  reviewSummary?: string
  reviewDate?: string
}) {
  return (
    <>
      {/* SoftwareApplication — Google rich results for software */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: `${name}: AI Agent Skill`,
          description,
          url: `${SITE_URL}${url}`,
          applicationCategory: category || 'DeveloperApplication',
          operatingSystem: platforms?.join(', ') || 'Any',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          author: {
            '@type': 'Person',
            name: author,
          },
          ...(license && { license }),
          ...(dateModified && { dateModified }),
          ...(datePublished && { datePublished }),
          ...(tags && tags.length > 0 && { keywords: tags.join(', ') }),
          ...(reviewScore != null && {
            review: {
              '@type': 'Review',
              author: {
                '@type': 'Organization',
                name: 'Skill Advisor',
                url: 'https://www.mdskills.ai/docs/skill-advisor',
              },
              reviewRating: {
                '@type': 'Rating',
                ratingValue: reviewScore,
                bestRating: 10,
                worstRating: 1,
              },
              ...(reviewSummary && { reviewBody: reviewSummary }),
              ...(reviewDate && { datePublished: reviewDate }),
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: reviewScore,
              bestRating: 10,
              worstRating: 1,
              ratingCount: 1,
            },
          }),
        }}
      />
      {/* SoftwareSourceCode — rich code metadata */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name,
          description,
          url: `${SITE_URL}${url}`,
          codeRepository: githubUrl || `${SITE_URL}${url}`,
          programmingLanguage: 'Markdown',
          author: {
            '@type': 'Person',
            name: author,
          },
          ...(license && { license }),
          ...(dateModified && { dateModified }),
          ...(datePublished && { datePublished }),
        }}
      />
    </>
  )
}

/** FAQPage schema for rich snippets in Google SERPs */
export function SkillFaqJsonLd({
  name,
  description,
  owner,
  slug,
  platforms,
}: {
  name: string
  description: string
  owner: string
  slug: string
  platforms?: string[]
}) {
  const platformNames = (platforms ?? []).map(p =>
    p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  )
  const platformList = platformNames.length > 0 ? platformNames.join(', ') : 'Claude Code and other AI agents'

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is ${name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${name} is a free, open-source AI agent skill. ${description}`,
            },
          },
          {
            '@type': 'Question',
            name: `How do I install ${name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Install ${name} with a single command: npx mdskills install ${owner}/${slug}. This downloads the skill files into your project and your AI agent picks them up automatically.`,
            },
          },
          {
            '@type': 'Question',
            name: `What platforms support ${name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${name} works with ${platformList}. Skills use the open SKILL.md format which is compatible with any AI coding agent that reads markdown instructions.`,
            },
          },
        ],
      }}
    />
  )
}

/** BreadcrumbList schema */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[]
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${SITE_URL}${item.url}`,
        })),
      }}
    />
  )
}
