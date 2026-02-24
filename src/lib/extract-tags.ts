/**
 * Shared tag extraction utility.
 * Extracts meaningful tags from repo name, description, and README content.
 * Used by both import scripts and the backfill-tags script.
 */

/** Noise words to exclude when splitting repo names into tags */
const TAG_NOISE_WORDS = new Set([
  'mcp', 'ai', 'agent', 'skill', 'claude', 'code', 'tool', 'server',
  'plugin', 'extension', 'the', 'for', 'and', 'with', 'your', 'app',
  'bot', 'kit', 'sdk', 'api', 'cli', 'dev', 'pro', 'hub', 'lab',
  'new', 'open', 'source', 'free', 'beta', 'alpha', 'v1', 'v2',
  'use', 'get', 'run', 'set', 'add', 'my', 'its', 'all', 'any',
])

/** Known technology/domain keywords → normalized tag name */
const TAG_KEYWORDS: Record<string, string> = {
  // Languages
  python: 'python',
  typescript: 'typescript',
  javascript: 'javascript',
  rust: 'rust',
  golang: 'golang',
  ruby: 'ruby',
  java: 'java',
  swift: 'swift',
  kotlin: 'kotlin',
  php: 'php',
  csharp: 'c-sharp',
  'c++': 'cpp',
  cpp: 'cpp',
  elixir: 'elixir',
  scala: 'scala',
  haskell: 'haskell',
  lua: 'lua',
  perl: 'perl',
  zig: 'zig',
  // Frameworks & runtimes
  react: 'react',
  vue: 'vue',
  angular: 'angular',
  nextjs: 'nextjs',
  svelte: 'svelte',
  django: 'django',
  flask: 'flask',
  express: 'express',
  fastapi: 'fastapi',
  rails: 'rails',
  laravel: 'laravel',
  spring: 'spring',
  nestjs: 'nestjs',
  nuxt: 'nuxt',
  remix: 'remix',
  astro: 'astro',
  gatsby: 'gatsby',
  electron: 'electron',
  tauri: 'tauri',
  // Platforms & infrastructure
  unity: 'unity',
  unreal: 'unreal',
  godot: 'godot',
  docker: 'docker',
  kubernetes: 'kubernetes',
  k8s: 'kubernetes',
  terraform: 'terraform',
  ansible: 'ansible',
  aws: 'aws',
  gcp: 'gcp',
  azure: 'azure',
  vercel: 'vercel',
  netlify: 'netlify',
  cloudflare: 'cloudflare',
  heroku: 'heroku',
  // Databases & data
  supabase: 'supabase',
  firebase: 'firebase',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  mysql: 'mysql',
  mongodb: 'mongodb',
  redis: 'redis',
  sqlite: 'sqlite',
  prisma: 'prisma',
  drizzle: 'drizzle',
  elasticsearch: 'elasticsearch',
  dynamodb: 'dynamodb',
  // Testing & quality
  testing: 'testing',
  jest: 'testing',
  pytest: 'testing',
  vitest: 'testing',
  playwright: 'testing',
  cypress: 'testing',
  mocha: 'testing',
  lint: 'linting',
  eslint: 'linting',
  prettier: 'formatting',
  // Security & auth
  security: 'security',
  auth: 'authentication',
  oauth: 'authentication',
  jwt: 'authentication',
  // DevOps & deployment
  cicd: 'ci-cd',
  devops: 'devops',
  deployment: 'deployment',
  monitoring: 'monitoring',
  logging: 'logging',
  // Version control
  git: 'git',
  github: 'github',
  gitlab: 'gitlab',
  bitbucket: 'bitbucket',
  // Domains
  '3d': '3d',
  gamedev: 'game-development',
  game: 'game-development',
  blockchain: 'blockchain',
  crypto: 'crypto',
  web3: 'web3',
  ml: 'machine-learning',
  'machine-learning': 'machine-learning',
  // Platforms & clients
  vscode: 'vscode',
  vim: 'vim',
  neovim: 'neovim',
  cursor: 'cursor',
  windsurf: 'windsurf',
  emacs: 'emacs',
  // Content & docs
  markdown: 'markdown',
  documentation: 'documentation',
  // Mobile
  mobile: 'mobile',
  ios: 'ios',
  android: 'android',
  // Data & AI
  scraping: 'web-scraping',
  scraper: 'web-scraping',
  crawler: 'web-scraping',
  rag: 'rag',
  embeddings: 'embeddings',
  llm: 'llm',
  openai: 'openai',
  anthropic: 'anthropic',
  gemini: 'gemini',
  // Integrations
  slack: 'slack',
  discord: 'discord',
  notion: 'notion',
  jira: 'jira',
  figma: 'figma',
  linear: 'linear',
  trello: 'trello',
  asana: 'asana',
  stripe: 'stripe',
  shopify: 'shopify',
  wordpress: 'wordpress',
  twilio: 'twilio',
  sendgrid: 'sendgrid',
  sentry: 'sentry',
  datadog: 'datadog',
  grafana: 'grafana',
  prometheus: 'prometheus',
  // Creative tools
  blender: 'blender',
  photoshop: 'photoshop',
  illustrator: 'illustrator',
  maya: 'maya',
  cinema4d: 'cinema4d',
  davinci: 'davinci-resolve',
  // Browsers
  browser: 'browser',
  chrome: 'chrome',
  firefox: 'firefox',
  puppeteer: 'puppeteer',
  selenium: 'selenium',
  // Finance & crypto
  finance: 'finance',
  trading: 'trading',
  stocks: 'finance',
  // Communication
  email: 'email',
  whatsapp: 'whatsapp',
  telegram: 'telegram',
  // Misc
  graphql: 'graphql',
  grpc: 'grpc',
  'rest-api': 'rest-api',
  restful: 'rest-api',
  websocket: 'websocket',
  regex: 'regex',
  cron: 'cron',
  queue: 'queue',
  cache: 'caching',
  pdf: 'pdf',
  csv: 'csv',
  json: 'json',
  yaml: 'yaml',
  xml: 'xml',
}

/**
 * Extract meaningful tags from a repo name, description, and README content.
 * Returns deduplicated, normalized tag strings.
 */
export function extractTagsFromContent(
  repo: string,
  description: string,
  readme: string | null,
): string[] {
  const tags = new Set<string>()

  // 1. Split repo name on hyphens/underscores, filter noise, map known keywords
  const repoParts = repo.toLowerCase().split(/[-_]+/)
  for (const part of repoParts) {
    if (part.length < 2 || TAG_NOISE_WORDS.has(part)) continue
    const mapped = TAG_KEYWORDS[part]
    if (mapped) {
      tags.add(mapped)
    }
  }

  // 2. Scan description for keyword matches
  const descWords = description.toLowerCase().split(/[\s,./;:()\[\]"']+/)
  for (const word of descWords) {
    if (!word || word.length < 2) continue
    const mapped = TAG_KEYWORDS[word]
    if (mapped) tags.add(mapped)
  }

  // 3. Scan first ~500 chars of README for keyword matches
  //    Use word boundary regex to avoid substring false positives
  //    (e.g., "scala" matching inside "scalable")
  if (readme) {
    const snippet = readme.slice(0, 500).toLowerCase()
    for (const [keyword, tag] of Object.entries(TAG_KEYWORDS)) {
      if (keyword.length >= 3) {
        const re = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
        if (re.test(snippet)) {
          tags.add(tag)
        }
      }
    }
  }

  return Array.from(tags)
}
