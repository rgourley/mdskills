/**
 * Seed real, popular SKILL.md agent skills from the ecosystem.
 * These are actual skill_pack artifacts — the core product.
 * Run: npm run seed:skills
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

interface SeedSkill {
  slug: string;
  name: string;
  description: string;
  owner: string;
  repo: string;
  skill_path: string;
  github_url: string;
  category_slug: string;
  github_stars: number;
  github_forks: number;
  license: string;
  weekly_installs: number;
  format_standard: string;
  platforms: string[];
  tags: string[];
  difficulty: string;
  perm_filesystem_read: boolean;
  perm_filesystem_write: boolean;
  perm_shell_exec: boolean;
  perm_network_access: boolean;
  perm_git_write: boolean;
  content: string;
  client_instructions: { slug: string; instructions: string; primary: boolean }[];
}

const SKILLS: SeedSkill[] = [
  // ── Anthropic Official Skills ─────────────────────────────────
  {
    slug: 'pdf-processing',
    name: 'PDF Processing',
    description: 'Extract text and tables from PDF files, create new PDFs, fill forms, merge and split documents. Use when working with PDF documents.',
    owner: 'anthropics',
    repo: 'skills',
    skill_path: 'skills/pdf',
    github_url: 'https://github.com/anthropics/skills/tree/main/skills/pdf',
    category_slug: 'content-creation',
    github_stars: 2800,
    github_forks: 350,
    license: 'MIT',
    weekly_installs: 18500,
    format_standard: 'skill_md',
    platforms: ['claude-code', 'claude-desktop', 'cursor', 'codex', 'gemini-cli'],
    tags: ['pdf', 'document-processing', 'text-extraction', 'forms', 'official'],
    difficulty: 'beginner',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: false,
    perm_git_write: false,
    content: `# PDF Processing

Extract text and tables from PDF files, create new PDFs, fill forms, merge and split documents.

## When to use this skill
Use when the user needs to work with PDF documents — extracting content, creating reports, filling forms, or combining multiple PDFs.

## How to extract text
1. Use pdfplumber for text extraction: \`scripts/extract_text.py\`
2. For tables, use \`scripts/extract_tables.py\`
3. Results are returned as structured data

## How to create PDFs
1. Use ReportLab for new PDF creation
2. Support for headers, tables, images, and styled text
3. Template support via \`assets/templates/\`

## How to fill forms
1. Detect form fields with \`scripts/detect_fields.py\`
2. Fill fields programmatically
3. Flatten filled forms for distribution

## Dependencies
- pdfplumber (text/table extraction)
- ReportLab (PDF creation)
- PyPDF2 (merge/split/forms)
`,
    client_instructions: [
      { slug: 'claude-code', instructions: 'This skill is built into Claude Code for paid plans.\n\nTo use manually:\n1. Clone: git clone https://github.com/anthropics/skills\n2. Point your skills directory to include skills/pdf', primary: true },
      { slug: 'cursor', instructions: 'Add the skill folder to your project:\n\n1. Clone https://github.com/anthropics/skills\n2. Copy skills/pdf/ to your .cursor/skills/ directory\n3. Cursor will discover it automatically', primary: false },
    ],
  },
  {
    slug: 'docx-documents',
    name: 'Word Documents (DOCX)',
    description: 'Create, edit, and analyze Word documents. Generate reports, letters, contracts with headers, tables, images, and styled formatting.',
    owner: 'anthropics',
    repo: 'skills',
    skill_path: 'skills/docx',
    github_url: 'https://github.com/anthropics/skills/tree/main/skills/docx',
    category_slug: 'content-creation',
    github_stars: 2800,
    github_forks: 350,
    license: 'MIT',
    weekly_installs: 14200,
    format_standard: 'skill_md',
    platforms: ['claude-code', 'claude-desktop', 'cursor', 'codex'],
    tags: ['docx', 'word', 'document-creation', 'reports', 'official'],
    difficulty: 'beginner',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: false,
    perm_git_write: false,
    content: `# Word Documents (DOCX)

Create, edit, and analyze Microsoft Word documents (.docx).

## When to use this skill
Use when the user needs to generate reports, letters, contracts, or any structured document in Word format.

## Capabilities
- Create new documents from scratch
- Add headers, paragraphs, tables, and images
- Apply styles and formatting
- Generate table of contents
- Insert page breaks and section breaks

## How to create a document
1. Use python-docx to create the document
2. Apply styles from the template library
3. Add content section by section
4. Save to the specified path

## Dependencies
- python-docx
`,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Built into Claude Code for paid plans.\n\nManual setup: clone https://github.com/anthropics/skills and add skills/docx to your skills path.', primary: true },
    ],
  },
  {
    slug: 'spreadsheets-xlsx',
    name: 'Spreadsheets (XLSX)',
    description: 'Create, edit, and analyze Excel spreadsheets. Build data tables, charts, formulas, pivot tables, and formatted reports.',
    owner: 'anthropics',
    repo: 'skills',
    skill_path: 'skills/xlsx',
    github_url: 'https://github.com/anthropics/skills/tree/main/skills/xlsx',
    category_slug: 'research-analysis',
    github_stars: 2800,
    github_forks: 350,
    license: 'MIT',
    weekly_installs: 11800,
    format_standard: 'skill_md',
    platforms: ['claude-code', 'claude-desktop', 'cursor', 'codex'],
    tags: ['xlsx', 'excel', 'spreadsheet', 'data-analysis', 'charts', 'official'],
    difficulty: 'beginner',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: false,
    perm_git_write: false,
    content: `# Spreadsheets (XLSX)

Create, edit, and analyze Excel spreadsheets.

## When to use this skill
Use when the user needs to work with spreadsheet data — creating reports, analyzing datasets, building charts, or generating formatted Excel files.

## Capabilities
- Create workbooks with multiple sheets
- Build data tables with formatting
- Add formulas and calculated columns
- Generate charts (bar, line, pie, scatter)
- Conditional formatting and data validation
- Pivot table support

## Dependencies
- openpyxl (read/write Excel files)
`,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Built into Claude Code for paid plans.\n\nManual setup: clone https://github.com/anthropics/skills and add skills/xlsx to your skills path.', primary: true },
    ],
  },
  {
    slug: 'presentations-pptx',
    name: 'Presentations (PPTX)',
    description: 'Create and edit PowerPoint presentations with slides, layouts, charts, images, and speaker notes. Build pitch decks and reports.',
    owner: 'anthropics',
    repo: 'skills',
    skill_path: 'skills/pptx',
    github_url: 'https://github.com/anthropics/skills/tree/main/skills/pptx',
    category_slug: 'content-creation',
    github_stars: 2800,
    github_forks: 350,
    license: 'MIT',
    weekly_installs: 9600,
    format_standard: 'skill_md',
    platforms: ['claude-code', 'claude-desktop', 'cursor', 'codex'],
    tags: ['pptx', 'powerpoint', 'presentations', 'slides', 'official'],
    difficulty: 'beginner',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: false,
    perm_git_write: false,
    content: `# Presentations (PPTX)

Create and edit PowerPoint presentations.

## When to use this skill
Use when the user needs to create slide decks, pitch presentations, reports, or any PowerPoint file.

## Capabilities
- Create presentations with multiple slide layouts
- Add text, images, charts, and tables
- Apply themes and color schemes
- Add speaker notes
- Support for animations and transitions
- Master slide customization

## Dependencies
- python-pptx
`,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Built into Claude Code for paid plans.\n\nManual setup: clone https://github.com/anthropics/skills and add skills/pptx to your skills path.', primary: true },
    ],
  },
  {
    slug: 'mcp-builder',
    name: 'MCP Server Builder',
    description: 'Create Model Context Protocol servers to integrate external APIs and services with AI agents. Scaffolds TypeScript or Python MCP servers.',
    owner: 'anthropics',
    repo: 'skills',
    skill_path: 'skills/mcp-builder',
    github_url: 'https://github.com/anthropics/skills/tree/main/skills/mcp-builder',
    category_slug: 'code-generation',
    github_stars: 2800,
    github_forks: 350,
    license: 'MIT',
    weekly_installs: 7200,
    format_standard: 'skill_md',
    platforms: ['claude-code', 'cursor', 'codex', 'gemini-cli', 'amp'],
    tags: ['mcp', 'server', 'api-integration', 'scaffolding', 'official'],
    difficulty: 'intermediate',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: true,
    perm_git_write: false,
    content: `# MCP Server Builder

Create Model Context Protocol (MCP) servers to integrate external APIs and services.

## When to use this skill
Use when the user wants to build an MCP server — connecting an AI agent to an external API, database, or service.

## What it does
1. Scaffolds a new MCP server project (TypeScript or Python)
2. Generates tool definitions from API specs
3. Implements request handlers
4. Sets up testing and configuration

## Steps
1. Ask the user which API or service to integrate
2. Choose language (TypeScript recommended)
3. Scaffold the project structure
4. Define tools and their parameters
5. Implement handlers
6. Test with a local MCP client

## Output structure
\`\`\`
my-mcp-server/
├── src/
│   ├── index.ts          # Server entry point
│   ├── tools/            # Tool implementations
│   └── types.ts          # Type definitions
├── package.json
├── tsconfig.json
└── README.md
\`\`\`
`,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Built into Claude Code.\n\nUsage: Ask Claude to "build an MCP server for [API name]"\nClaude will use this skill to scaffold and implement the server.', primary: true },
      { slug: 'cursor', instructions: 'Add the skill to your project:\n1. Clone https://github.com/anthropics/skills\n2. Copy skills/mcp-builder/ to your .cursor/skills/\n3. Ask Cursor to build an MCP server', primary: false },
    ],
  },
  {
    slug: 'webapp-testing',
    name: 'Web App Testing',
    description: 'Test local web applications using Playwright. Navigate pages, fill forms, click buttons, take screenshots, and verify behavior automatically.',
    owner: 'anthropics',
    repo: 'skills',
    skill_path: 'skills/webapp-testing',
    github_url: 'https://github.com/anthropics/skills/tree/main/skills/webapp-testing',
    category_slug: 'code-generation',
    github_stars: 2800,
    github_forks: 350,
    license: 'MIT',
    weekly_installs: 6100,
    format_standard: 'skill_md',
    platforms: ['claude-code', 'cursor', 'codex'],
    tags: ['testing', 'playwright', 'e2e', 'automation', 'web-apps', 'official'],
    difficulty: 'intermediate',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: true,
    perm_git_write: false,
    content: `# Web App Testing

Test local web applications using Playwright.

## When to use this skill
Use when the user wants to test a web application — navigating pages, filling forms, clicking buttons, verifying behavior, or taking screenshots.

## How it works
1. Launch a browser with Playwright
2. Navigate to the target URL
3. Interact with the page (click, type, select)
4. Assert expected behavior
5. Take screenshots for verification

## Capabilities
- Navigate to URLs and wait for elements
- Fill forms and submit data
- Click buttons and links
- Take full-page or element screenshots
- Assert text content, visibility, and attributes
- Handle dialogs and popups

## Prerequisites
- Node.js 18+
- Playwright installed: npx playwright install
`,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Built into Claude Code.\n\nUsage:\n1. Start your web app locally\n2. Ask Claude to "test my web app at localhost:3000"\n3. Claude will use Playwright to navigate and verify', primary: true },
    ],
  },
  {
    slug: 'skill-creator',
    name: 'Skill Creator',
    description: 'A meta-skill that creates new SKILL.md files. Researches best practices, structures instructions, and generates well-formed skills following the agentskills.io spec.',
    owner: 'anthropics',
    repo: 'skills',
    skill_path: 'skills/skill-creator',
    github_url: 'https://github.com/anthropics/skills/tree/main/skills/skill-creator',
    category_slug: 'code-generation',
    github_stars: 2800,
    github_forks: 350,
    license: 'MIT',
    weekly_installs: 5400,
    format_standard: 'skill_md',
    platforms: ['claude-code', 'cursor', 'codex', 'gemini-cli'],
    tags: ['meta-skill', 'skill-authoring', 'automation', 'official'],
    difficulty: 'beginner',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: false,
    perm_network_access: false,
    perm_git_write: false,
    content: `# Skill Creator

A meta-skill for creating new Agent Skills.

## When to use this skill
Use when the user wants to create a new SKILL.md file for any domain or task.

## How it works
1. Ask the user what the skill should do
2. Research best practices for the domain
3. Structure the skill with clear sections
4. Generate valid SKILL.md with frontmatter
5. Add supporting files if needed

## Output format
Generates a complete skill folder:
\`\`\`
new-skill/
├── SKILL.md          # Valid frontmatter + instructions
├── scripts/          # Helper scripts (if needed)
└── references/       # Reference docs (if needed)
\`\`\`

## Best practices applied
- Clear "when to use" section
- Step-by-step instructions
- Edge case handling
- Dependency documentation
`,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Built into Claude Code.\n\nUsage: Ask Claude to "create a skill for [task]"\nClaude will generate a complete SKILL.md following the spec.', primary: true },
    ],
  },

  // ── Vercel Official Skills ─────────────────────────────────────
  {
    slug: 'nextjs-best-practices',
    name: 'Next.js Best Practices',
    description: 'Official Vercel skill for Next.js development. App Router patterns, server components, data fetching, caching, and deployment best practices.',
    owner: 'vercel-labs',
    repo: 'agent-skills',
    skill_path: 'skills/next-best-practices',
    github_url: 'https://github.com/vercel-labs/agent-skills/tree/main/skills/next-best-practices',
    category_slug: 'code-generation',
    github_stars: 1200,
    github_forks: 180,
    license: 'MIT',
    weekly_installs: 15400,
    format_standard: 'skill_md',
    platforms: ['claude-code', 'cursor', 'codex', 'vscode-copilot', 'windsurf', 'gemini-cli'],
    tags: ['nextjs', 'react', 'vercel', 'app-router', 'server-components', 'official'],
    difficulty: 'intermediate',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: false,
    perm_git_write: false,
    content: `# Next.js Best Practices

Official Vercel skill for Next.js App Router development.

## When to use this skill
Use when working on a Next.js project, especially with the App Router (app/ directory).

## Key Patterns

### Server Components (default)
- Components in app/ are Server Components by default
- Use 'use client' only when you need interactivity
- Fetch data directly in Server Components (no useEffect)

### Data Fetching
- Use fetch() in Server Components with automatic caching
- Use \`revalidatePath\` or \`revalidateTag\` for cache invalidation
- Prefer server actions for mutations

### File Conventions
- page.tsx — Route UI
- layout.tsx — Shared layout (wraps children)
- loading.tsx — Loading state (Suspense boundary)
- error.tsx — Error boundary
- not-found.tsx — 404 page

### Performance
- Use dynamic imports for heavy client components
- Prefer Image component for automatic optimization
- Use generateStaticParams for static generation

## Anti-patterns to avoid
- Don't use 'use client' on every component
- Don't use useEffect for data fetching
- Don't put sensitive data in client components
`,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Add to your skills directory:\n\ngit clone https://github.com/vercel-labs/agent-skills\n\nOr install the skill directly when working on a Next.js project.', primary: true },
      { slug: 'cursor', instructions: 'Add to .cursor/skills/:\n1. Clone https://github.com/vercel-labs/agent-skills\n2. Copy skills/next-best-practices/ to your project', primary: false },
    ],
  },
  {
    slug: 'react-best-practices',
    name: 'React Best Practices',
    description: 'Official Vercel skill for modern React development. Hooks, component patterns, state management, performance optimization, and TypeScript conventions.',
    owner: 'vercel-labs',
    repo: 'agent-skills',
    skill_path: 'skills/react-best-practices',
    github_url: 'https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices',
    category_slug: 'code-generation',
    github_stars: 1200,
    github_forks: 180,
    license: 'MIT',
    weekly_installs: 12800,
    format_standard: 'skill_md',
    platforms: ['claude-code', 'cursor', 'codex', 'vscode-copilot', 'windsurf', 'gemini-cli'],
    tags: ['react', 'hooks', 'typescript', 'components', 'vercel', 'official'],
    difficulty: 'beginner',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: false,
    perm_network_access: false,
    perm_git_write: false,
    content: `# React Best Practices

Official Vercel skill for modern React development patterns.

## When to use this skill
Use when building React applications — component architecture, hooks usage, state management, and TypeScript patterns.

## Component Patterns
- Prefer functional components with TypeScript
- Use interfaces for props (not types)
- Colocate related files (component, styles, tests)

## Hooks Guidelines
- Extract custom hooks for reusable logic
- Use useMemo/useCallback only when needed (profile first)
- Prefer useReducer for complex state

## State Management
- Start with local state (useState)
- Lift state up before reaching for context
- Use server state libraries (TanStack Query) for API data

## TypeScript
- Type props with interfaces
- Use generics for reusable components
- Avoid \`any\` — prefer \`unknown\` when type is uncertain

## Performance
- Use React.memo sparingly (profile first)
- Virtualize long lists
- Code-split with lazy() and Suspense
`,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Add to your skills directory:\n\ngit clone https://github.com/vercel-labs/agent-skills\n\nThe skill activates automatically when working on React code.', primary: true },
      { slug: 'cursor', instructions: 'Add to .cursor/skills/:\n1. Clone https://github.com/vercel-labs/agent-skills\n2. Copy skills/react-best-practices/ to your project', primary: false },
    ],
  },

  // ── Cloudflare Official Skills ─────────────────────────────────
  {
    slug: 'cloudflare-workers',
    name: 'Cloudflare Workers & Wrangler',
    description: 'Deploy and manage Cloudflare Workers, KV, R2, D1, Vectorize, Queues, and Workflows using Wrangler CLI. Official Cloudflare skill.',
    owner: 'cloudflare',
    repo: 'skills',
    skill_path: 'skills/wrangler',
    github_url: 'https://github.com/cloudflare/skills/tree/main/skills/wrangler',
    category_slug: 'devops-ci-cd',
    github_stars: 950,
    github_forks: 120,
    license: 'Apache-2.0',
    weekly_installs: 8900,
    format_standard: 'skill_md',
    platforms: ['claude-code', 'cursor', 'codex', 'windsurf', 'gemini-cli'],
    tags: ['cloudflare', 'workers', 'wrangler', 'edge', 'serverless', 'official'],
    difficulty: 'intermediate',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: true,
    perm_git_write: false,
    content: `# Cloudflare Workers & Wrangler

Deploy and manage Cloudflare Workers and associated services.

## When to use this skill
Use when building or deploying to Cloudflare Workers, or working with Cloudflare services (KV, R2, D1, Vectorize, Queues).

## Quick Start
\`\`\`bash
npx wrangler init my-worker
npx wrangler dev          # Local development
npx wrangler deploy       # Deploy to Cloudflare
\`\`\`

## Services
- **Workers** — Serverless JavaScript/TypeScript at the edge
- **KV** — Global key-value storage
- **R2** — S3-compatible object storage
- **D1** — SQLite at the edge
- **Vectorize** — Vector database for AI
- **Queues** — Message queues
- **Durable Objects** — Stateful coordination

## Configuration
All config lives in \`wrangler.toml\`:
\`\`\`toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "MY_KV"
id = "abc123"
\`\`\`
`,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Install the skill:\n\ngit clone https://github.com/cloudflare/skills\n\nClaude will use wrangler commands to manage Workers.', primary: true },
      { slug: 'cursor', instructions: 'Add skills/wrangler/ from https://github.com/cloudflare/skills to your .cursor/skills/ directory.', primary: false },
    ],
  },

  // ── Stripe Official Skills ─────────────────────────────────────
  {
    slug: 'stripe-integration',
    name: 'Stripe Best Practices',
    description: 'Official Stripe skill for building payment integrations. Checkout, subscriptions, webhooks, Connect, and error handling patterns.',
    owner: 'stripe',
    repo: 'ai',
    skill_path: 'skills/stripe-best-practices',
    github_url: 'https://github.com/stripe/ai/tree/main/skills/stripe-best-practices',
    category_slug: 'code-generation',
    github_stars: 680,
    github_forks: 90,
    license: 'MIT',
    weekly_installs: 7600,
    format_standard: 'skill_md',
    platforms: ['claude-code', 'cursor', 'codex', 'vscode-copilot', 'windsurf'],
    tags: ['stripe', 'payments', 'checkout', 'subscriptions', 'webhooks', 'official'],
    difficulty: 'intermediate',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: true,
    perm_git_write: false,
    content: `# Stripe Best Practices

Build reliable Stripe integrations following official patterns.

## When to use this skill
Use when integrating Stripe for payments, subscriptions, or marketplace features.

## Key Patterns

### Checkout Session
- Always use Checkout for payment collection
- Set success_url and cancel_url
- Use metadata for your internal references

### Webhooks
- Always verify webhook signatures
- Handle events idempotently
- Process events asynchronously

### Error Handling
- Catch StripeError specifically
- Handle card_declined, expired_card, etc.
- Show user-friendly error messages

### Security
- Never log full card numbers
- Use restricted API keys in production
- Store webhook secrets in environment variables

## Common Integration Flows
1. One-time payment → Checkout Session
2. Subscriptions → Checkout + Customer Portal
3. Marketplace → Connect + Transfers
`,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Add the skill:\n\ngit clone https://github.com/stripe/ai\n\nClaude will apply Stripe best practices when generating payment code.', primary: true },
    ],
  },

  // ── Hugging Face Official Skills ──────────────────────────────
  {
    slug: 'huggingface-hub',
    name: 'Hugging Face Hub CLI',
    description: 'Manage models, datasets, and Spaces on the Hugging Face Hub. Upload, download, search, and run inference using the HF CLI.',
    owner: 'huggingface',
    repo: 'skills',
    skill_path: 'skills/hugging-face-cli',
    github_url: 'https://github.com/huggingface/skills/tree/main/skills/hugging-face-cli',
    category_slug: 'research-analysis',
    github_stars: 520,
    github_forks: 65,
    license: 'Apache-2.0',
    weekly_installs: 6300,
    format_standard: 'skill_md',
    platforms: ['claude-code', 'cursor', 'codex', 'gemini-cli'],
    tags: ['huggingface', 'models', 'datasets', 'ml', 'inference', 'official'],
    difficulty: 'intermediate',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: true,
    perm_git_write: false,
    content: `# Hugging Face Hub CLI

Manage models, datasets, and Spaces on the Hugging Face Hub.

## When to use this skill
Use when working with Hugging Face — downloading models, uploading datasets, searching the Hub, or running inference.

## Setup
\`\`\`bash
pip install huggingface_hub
huggingface-cli login
\`\`\`

## Common Operations

### Download a model
\`\`\`bash
huggingface-cli download meta-llama/Llama-3-8B
\`\`\`

### Upload a dataset
\`\`\`bash
huggingface-cli upload my-org/my-dataset ./data --repo-type dataset
\`\`\`

### Search the Hub
\`\`\`bash
huggingface-cli search models --query "text-generation" --sort downloads
\`\`\`

### Run inference
\`\`\`python
from huggingface_hub import InferenceClient
client = InferenceClient()
result = client.text_generation("Hello, ", model="meta-llama/Llama-3-8B")
\`\`\`

## Permissions
- Requires HF_TOKEN for authenticated operations
- Network access for Hub API
`,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Install the skill:\n\ngit clone https://github.com/huggingface/skills\n\nEnsure huggingface_hub is installed: pip install huggingface_hub', primary: true },
    ],
  },

  // ── Community Skills ──────────────────────────────────────────
  {
    slug: 'algorithmic-art',
    name: 'Algorithmic Art',
    description: 'Create generative art using p5.js with seeded randomness. Produces deterministic, reproducible patterns, animations, and visual designs.',
    owner: 'anthropics',
    repo: 'skills',
    skill_path: 'skills/algorithmic-art',
    github_url: 'https://github.com/anthropics/skills/tree/main/skills/algorithmic-art',
    category_slug: 'design-systems',
    github_stars: 2800,
    github_forks: 350,
    license: 'MIT',
    weekly_installs: 4800,
    format_standard: 'skill_md',
    platforms: ['claude-code', 'claude-desktop', 'cursor'],
    tags: ['generative-art', 'p5js', 'creative-coding', 'visual-design', 'official'],
    difficulty: 'intermediate',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: false,
    perm_git_write: false,
    content: `# Algorithmic Art

Create generative art using p5.js with seeded randomness.

## When to use this skill
Use when the user wants to create generative art, visual patterns, animations, or creative coding projects.

## How it works
1. Use p5.js for rendering
2. Seed the random number generator for reproducibility
3. Apply mathematical patterns (noise, fractals, attractors)
4. Export as PNG, SVG, or animated GIF

## Techniques
- Perlin noise fields
- Particle systems
- L-systems and fractals
- Color palettes from color theory
- Grid-based compositions
- Recursive patterns

## Output
- HTML file with embedded p5.js sketch
- Screenshot capability for static exports
- Deterministic output via seeded randomness
`,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Built into Claude Code for paid plans. Ask Claude to "create algorithmic art" to activate.', primary: true },
    ],
  },
  {
    slug: 'frontend-design',
    name: 'Frontend Design',
    description: 'Design and build frontend interfaces with modern CSS, responsive layouts, animations, and accessibility best practices. UI/UX patterns.',
    owner: 'anthropics',
    repo: 'skills',
    skill_path: 'skills/frontend-design',
    github_url: 'https://github.com/anthropics/skills/tree/main/skills/frontend-design',
    category_slug: 'design-systems',
    github_stars: 2800,
    github_forks: 350,
    license: 'MIT',
    weekly_installs: 8200,
    format_standard: 'skill_md',
    platforms: ['claude-code', 'cursor', 'codex', 'windsurf'],
    tags: ['frontend', 'css', 'ui-design', 'responsive', 'accessibility', 'official'],
    difficulty: 'beginner',
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: false,
    perm_network_access: false,
    perm_git_write: false,
    content: `# Frontend Design

Design and build frontend interfaces with modern best practices.

## When to use this skill
Use when building user interfaces — landing pages, dashboards, forms, navigation, or any visual component.

## Design Principles
- Mobile-first responsive design
- Consistent spacing and typography
- Accessible by default (WCAG 2.1 AA)
- Progressive enhancement

## Patterns
- Component composition over inheritance
- CSS custom properties for theming
- Container queries for responsive components
- View transitions for smooth navigation

## Accessibility
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast ratios ≥ 4.5:1
- Focus indicators
`,
    client_instructions: [
      { slug: 'claude-code', instructions: 'Built into Claude Code. Activates when building UI components.', primary: true },
      { slug: 'cursor', instructions: 'Add skills/frontend-design/ from https://github.com/anthropics/skills to your .cursor/skills/', primary: false },
    ],
  },
];

async function getCategoryId(slug: string): Promise<string | null> {
  const { data } = await supabase.from('categories').select('id').eq('slug', slug).single();
  return data?.id ?? null;
}

async function seedSkill(skill: SeedSkill): Promise<boolean> {
  console.log(`\nSeeding: ${skill.name}`);

  const categoryId = await getCategoryId(skill.category_slug);

  const { data, error } = await supabase
    .from('skills')
    .upsert({
      slug: skill.slug,
      name: skill.name,
      description: skill.description,
      owner: skill.owner,
      repo: skill.repo,
      skill_path: skill.skill_path,
      github_url: skill.github_url,
      content: skill.content,
      status: 'published',
      featured: true,
      skill_type: 'skill',
      has_plugin: false,
      has_examples: true,
      difficulty: skill.difficulty,
      category_id: categoryId,
      author_username: skill.owner,
      github_stars: skill.github_stars,
      github_forks: skill.github_forks,
      license: skill.license,
      weekly_installs: skill.weekly_installs,
      mdskills_upvotes: 0,
      mdskills_forks: 0,
      platforms: skill.platforms,
      tags: skill.tags,
      artifact_type: 'skill_pack',
      format_standard: skill.format_standard,
      perm_filesystem_read: skill.perm_filesystem_read,
      perm_filesystem_write: skill.perm_filesystem_write,
      perm_shell_exec: skill.perm_shell_exec,
      perm_network_access: skill.perm_network_access,
      perm_git_write: skill.perm_git_write,
    }, { onConflict: 'slug' })
    .select('id, slug, name')
    .single();

  if (error) {
    console.log(`  ✗ Error: ${error.message}`);
    return false;
  }
  console.log(`  ✓ Saved: ${data?.name}`);

  // Populate listing_clients
  if (data?.id && skill.client_instructions.length > 0) {
    for (const ci of skill.client_instructions) {
      const { data: client } = await supabase.from('clients').select('id').eq('slug', ci.slug).single();
      if (client) {
        await supabase.from('listing_clients').upsert({
          skill_id: data.id,
          client_id: client.id,
          install_instructions: ci.instructions,
          is_primary: ci.primary,
        }, { onConflict: 'skill_id,client_id' });
        console.log(`    → ${ci.slug}`);
      }
    }
  }

  return true;
}

async function main() {
  console.log('🌱 Seeding real SKILL.md agent skills...\n');

  let success = 0;
  let failed = 0;

  for (const skill of SKILLS) {
    const ok = await seedSkill(skill);
    if (ok) success++;
    else failed++;
  }

  console.log(`\n✅ Done! ${success} skills seeded, ${failed} failed.`);
  console.log('\nSkills added:');
  for (const s of SKILLS) {
    console.log(`  ${s.owner}/${s.slug}`);
  }
}

main().catch(console.error);
