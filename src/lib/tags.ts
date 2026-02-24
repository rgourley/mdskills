/**
 * Tag data functions for tag browse and detail pages.
 */
import { createClient } from '@/lib/supabase/server'
import { createApiClient } from '@/lib/supabase/api'

export interface TagInfo {
  slug: string
  name: string
  title: string
  description: string
  skillCount: number
}

/** Hand-written SEO copy for popular tags */
const TAG_SEO_COPY: Record<string, { title: string; description: string }> = {
  javascript: {
    title: 'JavaScript AI Agent Skills',
    description: 'AI agent skills for JavaScript development. ESLint configs, React patterns, Node.js workflows, and testing tools for your AI coding assistant.',
  },
  typescript: {
    title: 'TypeScript AI Agent Skills',
    description: 'AI agent skills for TypeScript development. Type-safe patterns, configuration, and best practices for your AI coding assistant.',
  },
  python: {
    title: 'Python AI Agent Skills',
    description: 'AI agent skills for Python development. Django, FastAPI, pytest, data science workflows, and more for your AI coding assistant.',
  },
  react: {
    title: 'React AI Agent Skills',
    description: 'AI agent skills for React development. Component patterns, state management, hooks, testing, and performance optimization.',
  },
  vue: {
    title: 'Vue.js AI Agent Skills',
    description: 'AI agent skills for Vue.js development. Component patterns, Vuex/Pinia state management, and Vue ecosystem tools.',
  },
  nextjs: {
    title: 'Next.js AI Agent Skills',
    description: 'AI agent skills for Next.js development. App Router patterns, API routes, SSR, and deployment workflows.',
  },
  svelte: {
    title: 'Svelte AI Agent Skills',
    description: 'AI agent skills for Svelte and SvelteKit development. Component patterns, stores, and modern web app workflows.',
  },
  rust: {
    title: 'Rust AI Agent Skills',
    description: 'AI agent skills for Rust development. Memory safety patterns, cargo workflows, and systems programming best practices.',
  },
  golang: {
    title: 'Go AI Agent Skills',
    description: 'AI agent skills for Go development. Concurrency patterns, module management, and idiomatic Go workflows.',
  },
  docker: {
    title: 'Docker AI Agent Skills',
    description: 'AI agent skills for Docker and containerization. Dockerfile best practices, compose workflows, and container orchestration.',
  },
  kubernetes: {
    title: 'Kubernetes AI Agent Skills',
    description: 'AI agent skills for Kubernetes. Deployment manifests, helm charts, cluster management, and cloud-native workflows.',
  },
  testing: {
    title: 'Testing AI Agent Skills',
    description: 'AI agent skills for software testing. Unit tests, integration tests, E2E testing, TDD workflows, and test automation.',
  },
  security: {
    title: 'Security AI Agent Skills',
    description: 'AI agent skills for application security. Vulnerability scanning, secure coding patterns, authentication, and audit workflows.',
  },
  authentication: {
    title: 'Authentication AI Agent Skills',
    description: 'AI agent skills for auth implementation. OAuth, JWT, session management, and secure login workflows.',
  },
  deployment: {
    title: 'Deployment AI Agent Skills',
    description: 'AI agent skills for deployment and CI/CD. Automated deploys, pipeline configuration, and release management.',
  },
  aws: {
    title: 'AWS AI Agent Skills',
    description: 'AI agent skills for Amazon Web Services. Lambda, S3, EC2, CloudFormation, and AWS best practices.',
  },
  gcp: {
    title: 'GCP AI Agent Skills',
    description: 'AI agent skills for Google Cloud Platform. Cloud Run, BigQuery, Pub/Sub, and GCP workflows.',
  },
  azure: {
    title: 'Azure AI Agent Skills',
    description: 'AI agent skills for Microsoft Azure. Functions, App Service, DevOps, and Azure cloud workflows.',
  },
  git: {
    title: 'Git AI Agent Skills',
    description: 'AI agent skills for Git workflows. Branching strategies, commit conventions, PR reviews, and version control best practices.',
  },
  github: {
    title: 'GitHub AI Agent Skills',
    description: 'AI agent skills for GitHub. Actions workflows, PR automation, issue management, and repository best practices.',
  },
  django: {
    title: 'Django AI Agent Skills',
    description: 'AI agent skills for Django development. Models, views, templates, REST framework, and Django best practices.',
  },
  fastapi: {
    title: 'FastAPI AI Agent Skills',
    description: 'AI agent skills for FastAPI development. Async endpoints, Pydantic models, and modern Python API patterns.',
  },
  postgresql: {
    title: 'PostgreSQL AI Agent Skills',
    description: 'AI agent skills for PostgreSQL. Schema design, query optimization, migrations, and database administration.',
  },
  mongodb: {
    title: 'MongoDB AI Agent Skills',
    description: 'AI agent skills for MongoDB. Schema design, aggregation pipelines, indexing, and NoSQL best practices.',
  },
  redis: {
    title: 'Redis AI Agent Skills',
    description: 'AI agent skills for Redis. Caching strategies, pub/sub, data structures, and session management.',
  },
  graphql: {
    title: 'GraphQL AI Agent Skills',
    description: 'AI agent skills for GraphQL. Schema design, resolvers, code generation, and API best practices.',
  },
  devops: {
    title: 'DevOps AI Agent Skills',
    description: 'AI agent skills for DevOps. Infrastructure as code, CI/CD pipelines, monitoring, and automation workflows.',
  },
  terraform: {
    title: 'Terraform AI Agent Skills',
    description: 'AI agent skills for Terraform. Infrastructure as code, module design, state management, and multi-cloud provisioning.',
  },
  supabase: {
    title: 'Supabase AI Agent Skills',
    description: 'AI agent skills for Supabase. Database queries, auth setup, real-time subscriptions, and edge functions.',
  },
  firebase: {
    title: 'Firebase AI Agent Skills',
    description: 'AI agent skills for Firebase. Firestore, authentication, cloud functions, and hosting workflows.',
  },
  prisma: {
    title: 'Prisma AI Agent Skills',
    description: 'AI agent skills for Prisma ORM. Schema design, migrations, queries, and database workflow automation.',
  },
  llm: {
    title: 'LLM & AI Agent Skills',
    description: 'AI agent skills for working with large language models. Prompt engineering, API integration, and AI workflow patterns.',
  },
  rag: {
    title: 'RAG AI Agent Skills',
    description: 'AI agent skills for retrieval-augmented generation. Embedding pipelines, vector search, and knowledge base workflows.',
  },
  openai: {
    title: 'OpenAI API Agent Skills',
    description: 'AI agent skills for OpenAI API integration. GPT models, embeddings, function calling, and assistant workflows.',
  },
  slack: {
    title: 'Slack AI Agent Skills',
    description: 'AI agent skills for Slack. Bot development, webhook integration, interactive messages, and Slack app workflows.',
  },
  discord: {
    title: 'Discord AI Agent Skills',
    description: 'AI agent skills for Discord. Bot development, slash commands, event handling, and Discord.js patterns.',
  },
  unity: {
    title: 'Unity AI Agent Skills',
    description: 'AI agent skills for Unity game development. C# scripting, scene management, physics, and 3D workflow patterns.',
  },
  stripe: {
    title: 'Stripe AI Agent Skills',
    description: 'AI agent skills for Stripe integration. Payment processing, subscription management, and checkout workflows.',
  },
  documentation: {
    title: 'Documentation AI Agent Skills',
    description: 'AI agent skills for writing documentation. API docs, README generation, code comments, and technical writing.',
  },
  linting: {
    title: 'Linting AI Agent Skills',
    description: 'AI agent skills for code linting and formatting. ESLint, Prettier, style enforcement, and code quality automation.',
  },
  cursor: {
    title: 'Cursor AI Agent Skills',
    description: 'AI agent skills designed for Cursor IDE. Custom rules, workspace setup, and Cursor-specific workflows.',
  },
  vscode: {
    title: 'VS Code AI Agent Skills',
    description: 'AI agent skills for Visual Studio Code. Extension configurations, workspace settings, and VS Code workflows.',
  },
  mobile: {
    title: 'Mobile Development AI Agent Skills',
    description: 'AI agent skills for mobile app development. iOS, Android, React Native, and cross-platform patterns.',
  },
  ios: {
    title: 'iOS AI Agent Skills',
    description: 'AI agent skills for iOS development. SwiftUI, UIKit, Xcode workflows, and App Store best practices.',
  },
  android: {
    title: 'Android AI Agent Skills',
    description: 'AI agent skills for Android development. Kotlin, Jetpack Compose, Gradle, and Play Store workflows.',
  },
  php: {
    title: 'PHP AI Agent Skills',
    description: 'AI agent skills for PHP development. Laravel, Symfony, WordPress, and modern PHP patterns.',
  },
  laravel: {
    title: 'Laravel AI Agent Skills',
    description: 'AI agent skills for Laravel development. Eloquent, Blade templates, artisan commands, and Laravel best practices.',
  },
  rails: {
    title: 'Ruby on Rails AI Agent Skills',
    description: 'AI agent skills for Rails development. ActiveRecord, controllers, migrations, and Rails conventions.',
  },
  java: {
    title: 'Java AI Agent Skills',
    description: 'AI agent skills for Java development. Spring Boot, Maven/Gradle, JUnit, and enterprise Java patterns.',
  },
  swift: {
    title: 'Swift AI Agent Skills',
    description: 'AI agent skills for Swift development. SwiftUI, Combine, concurrency, and Apple platform patterns.',
  },
  kotlin: {
    title: 'Kotlin AI Agent Skills',
    description: 'AI agent skills for Kotlin development. Coroutines, Jetpack Compose, multiplatform, and Kotlin best practices.',
  },
  'web-scraping': {
    title: 'Web Scraping AI Agent Skills',
    description: 'AI agent skills for web scraping and data extraction. Crawling patterns, parsing, and automation workflows.',
  },
  monitoring: {
    title: 'Monitoring AI Agent Skills',
    description: 'AI agent skills for application monitoring. Logging, alerting, metrics collection, and observability workflows.',
  },
  'ci-cd': {
    title: 'CI/CD AI Agent Skills',
    description: 'AI agent skills for continuous integration and deployment. Pipeline design, automated testing, and release workflows.',
  },
  notion: {
    title: 'Notion AI Agent Skills',
    description: 'AI agent skills for Notion integration. Database management, page creation, and Notion API workflows.',
  },
  figma: {
    title: 'Figma AI Agent Skills',
    description: 'AI agent skills for Figma integration. Design token extraction, component generation, and design-to-code workflows.',
  },
  'game-development': {
    title: 'Game Development AI Agent Skills',
    description: 'AI agent skills for game development. Unity, Unreal, Godot, game design patterns, and engine workflows.',
  },
  markdown: {
    title: 'Markdown AI Agent Skills',
    description: 'AI agent skills for Markdown processing. Documentation generation, formatting, and content management workflows.',
  },
  anthropic: {
    title: 'Anthropic API Agent Skills',
    description: 'AI agent skills for Anthropic Claude API. Message creation, tool use, streaming, and Claude integration patterns.',
  },
}

/** Convert a tag slug to a display name */
function tagDisplayName(slug: string): string {
  // Check if we have custom copy
  const copy = TAG_SEO_COPY[slug]
  if (copy) {
    // Extract the main term from the title (e.g., "JavaScript AI Agent Skills" → "JavaScript")
    return copy.title.replace(/ AI Agent Skills$/, '').replace(/ Agent Skills$/, '')
  }
  // Fallback: title-case the slug
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Build a TagInfo object from a slug and count */
function buildTagInfo(slug: string, skillCount: number): TagInfo {
  const copy = TAG_SEO_COPY[slug]
  const name = tagDisplayName(slug)
  return {
    slug,
    name,
    title: copy?.title ?? `${name} AI Agent Skills`,
    description: copy?.description ?? `Browse AI agent skills tagged "${name}". Find and install skills, MCP servers, and plugins for your AI coding assistant.`,
    skillCount,
  }
}

/**
 * Get all unique tags with skill counts, sorted by count descending.
 * Uses the skills.tags array column.
 */
export async function getAllTags(): Promise<TagInfo[]> {
  const supabase = await createClient()
  if (!supabase) return []

  // Fetch all tags arrays from published skills
  const { data, error } = await supabase
    .from('skills')
    .select('tags')
    .or('status.eq.published,status.is.null')

  if (error || !data) return []

  // Aggregate: count occurrences of each tag
  const counts = new Map<string, number>()
  for (const row of data) {
    const tags: string[] = (row as { tags: string[] }).tags ?? []
    for (const tag of tags) {
      if (tag) counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  // Build TagInfo objects, sorted by count desc
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([slug, count]) => buildTagInfo(slug, count))
}

/**
 * Get all unique tag slugs (for generateStaticParams and sitemap).
 * Uses the API client (no cookie auth) so it works at build time.
 */
export async function getAllTagSlugs(): Promise<string[]> {
  const supabase = createApiClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('skills')
    .select('tags')
    .or('status.eq.published,status.is.null')

  if (error || !data) return []

  const slugs = new Set<string>()
  for (const row of data) {
    const tags: string[] = (row as { tags: string[] }).tags ?? []
    for (const tag of tags) {
      if (tag) slugs.add(tag)
    }
  }

  return Array.from(slugs).sort()
}

/**
 * Get tag info for a single tag slug.
 */
export async function getTagInfo(slug: string): Promise<TagInfo | null> {
  const supabase = await createClient()
  if (!supabase) return null

  // Count skills with this tag
  const { count, error } = await supabase
    .from('skills')
    .select('id', { count: 'exact', head: true })
    .or('status.eq.published,status.is.null')
    .contains('tags', [slug])

  if (error || count === null || count === 0) return null

  return buildTagInfo(slug, count)
}

