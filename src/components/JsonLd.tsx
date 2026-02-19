/** JSON-LD structured data component for SEO */

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
        url: 'https://mdskills.ai',
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
        url: 'https://mdskills.ai',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://mdskills.ai/skills?q={search_term_string}',
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
  tags,
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
  tags?: string[]
}) {
  return (
    <>
      {/* SoftwareApplication — Google rich results for software */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: `${name} — AI Agent Skill`,
          description,
          url: `https://mdskills.ai${url}`,
          applicationCategory: category || 'DeveloperApplication',
          operatingSystem: platforms?.join(', ') || 'Any',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          author: {
            '@type': 'Organization',
            name: author,
          },
          ...(license && { license }),
          ...(dateModified && { dateModified }),
          ...(tags && tags.length > 0 && { keywords: tags.join(', ') }),
        }}
      />
      {/* SoftwareSourceCode — rich code metadata */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name,
          description,
          url: `https://mdskills.ai${url}`,
          codeRepository: githubUrl || `https://mdskills.ai${url}`,
          programmingLanguage: 'Markdown',
          author: {
            '@type': 'Person',
            name: author,
          },
          ...(license && { license }),
          ...(dateModified && { dateModified }),
        }}
      />
    </>
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
          item: `https://mdskills.ai${item.url}`,
        })),
      }}
    />
  )
}
