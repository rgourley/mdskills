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

/** SoftwareApplication schema for individual skills */
export function SkillJsonLd({
  name,
  description,
  url,
  author,
  license,
  category,
}: {
  name: string
  description: string
  url: string
  author: string
  license?: string
  category?: string
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareSourceCode',
        name,
        description,
        url: `https://mdskills.ai${url}`,
        author: {
          '@type': 'Person',
          name: author,
        },
        ...(license && { license }),
        ...(category && { applicationCategory: category }),
        codeRepository: `https://mdskills.ai${url}`,
        programmingLanguage: 'Markdown',
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
          item: `https://mdskills.ai${item.url}`,
        })),
      }}
    />
  )
}
