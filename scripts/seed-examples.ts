/**
 * Seed one real example per artifact type to test information architecture.
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 * Run: npm run seed:examples
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
  artifact_type: string;
  category_slug: string;
  github_stars: number;
  github_forks: number;
  license: string;
  weekly_installs: number;
  platforms: string[];
  tags: string[];
  difficulty: string;
  has_plugin: boolean;
  has_examples: boolean;
  perm_filesystem_read: boolean;
  perm_filesystem_write: boolean;
  perm_shell_exec: boolean;
  perm_network_access: boolean;
  perm_git_write: boolean;
  content: string;
  client_instructions: { slug: string; instructions: string; primary: boolean }[];
}

const EXAMPLES: SeedSkill[] = [
  // ── MCP Server ──────────────────────────────────────────────
  {
    slug: 'brave-search-mcp',
    name: 'Brave Search MCP Server',
    description: 'MCP server providing web search, local business search, and news via the Brave Search API. Gives AI agents the ability to search the web in real time.',
    owner: 'modelcontextprotocol',
    repo: 'servers',
    skill_path: 'src/brave-search',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
    artifact_type: 'mcp_server',
    category_slug: 'research-analysis',
    github_stars: 850,
    github_forks: 120,
    license: 'MIT',
    weekly_installs: 4200,
    platforms: ['claude-code', 'claude-desktop', 'cursor', 'windsurf', 'continue-dev'],
    tags: ['web-search', 'mcp', 'brave', 'search-api', 'research'],
    difficulty: 'beginner',
    has_plugin: false,
    has_examples: true,
    perm_filesystem_read: false,
    perm_filesystem_write: false,
    perm_shell_exec: false,
    perm_network_access: true,
    perm_git_write: false,
    content: `# Brave Search MCP Server

An MCP server that provides web search capabilities via the Brave Search API.

## Setup

1. Get a Brave Search API key at https://brave.com/search/api/
2. Add to your MCP config:

\`\`\`json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-api-key"
      }
    }
  }
}
\`\`\`

## Tools

- \`brave_web_search\` — Search the web with pagination and filtering
- \`brave_local_search\` — Search for local businesses and places

## Permissions

- Requires network access (calls Brave Search API)
- No filesystem or shell access needed
`,
    client_instructions: [
      {
        slug: 'claude-code',
        instructions: 'Add to ~/.claude/settings.json under "mcpServers":\n\n{\n  "brave-search": {\n    "command": "npx",\n    "args": ["-y", "@anthropic/mcp-server-brave-search"],\n    "env": { "BRAVE_API_KEY": "your-key" }\n  }\n}',
        primary: true,
      },
      {
        slug: 'claude-desktop',
        instructions: 'Add to Claude Desktop config (Settings → Developer → MCP Servers):\n\n{\n  "brave-search": {\n    "command": "npx",\n    "args": ["-y", "@anthropic/mcp-server-brave-search"],\n    "env": { "BRAVE_API_KEY": "your-key" }\n  }\n}',
        primary: false,
      },
      {
        slug: 'cursor',
        instructions: 'Add to .cursor/mcp.json in your project:\n\n{\n  "mcpServers": {\n    "brave-search": {\n      "command": "npx",\n      "args": ["-y", "@anthropic/mcp-server-brave-search"],\n      "env": { "BRAVE_API_KEY": "your-key" }\n    }\n  }\n}',
        primary: false,
      },
    ],
  },

  // ── Workflow Pack ────────────────────────────────────────────
  {
    slug: 'genaiops-promptflow',
    name: 'GenAIOps Prompt Flow Template',
    description: 'End-to-end GenAIOps template for building LLM-infused apps with Prompt Flow, including CI/CD pipelines, A/B deployment, and lifecycle management.',
    owner: 'microsoft',
    repo: 'genaiops-promptflow-template',
    skill_path: '.',
    github_url: 'https://github.com/microsoft/genaiops-promptflow-template',
    artifact_type: 'workflow_pack',
    category_slug: 'devops-ci-cd',
    github_stars: 259,
    github_forks: 180,
    license: 'MIT',
    weekly_installs: 890,
    platforms: ['vscode-copilot', 'chatgpt', 'codex'],
    tags: ['promptflow', 'llmops', 'ci-cd', 'workflow', 'azure'],
    difficulty: 'advanced',
    has_plugin: false,
    has_examples: true,
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: true,
    perm_git_write: true,
    content: `# GenAIOps Prompt Flow Template

End-to-end solution template for GenAIOps using Azure Machine Learning Prompt Flow.

## What This Workflow Does

1. **Experiment** — Develop and test prompt variants locally
2. **Evaluate** — Run bulk tests with built-in evaluation flows
3. **Deploy** — CI/CD pipeline deploys to Azure ML endpoints
4. **Monitor** — A/B testing and performance tracking

## Getting Started

\`\`\`bash
git clone https://github.com/microsoft/genaiops-promptflow-template
cd genaiops-promptflow-template
pip install -r requirements.txt
\`\`\`

## Prerequisites

- Azure subscription
- Azure ML workspace
- Python 3.9+

## Permissions

- Full filesystem access (reads/writes flow files)
- Shell execution (runs evaluation scripts)
- Network access (Azure ML API calls)
- Git write (CI/CD pipeline commits)
`,
    client_instructions: [
      {
        slug: 'vscode-copilot',
        instructions: 'Clone the repo and open in VS Code:\n\ngit clone https://github.com/microsoft/genaiops-promptflow-template\ncode genaiops-promptflow-template\n\nInstall the Prompt Flow VS Code extension for full support.',
        primary: true,
      },
    ],
  },

  // ── Ruleset ─────────────────────────────────────────────────
  {
    slug: 'awesome-cursorrules',
    name: 'Awesome CursorRules',
    description: 'Curated collection of .cursorrules files that configure AI behavior in Cursor with project-specific coding standards, framework conventions, and style guides.',
    owner: 'PatrickJS',
    repo: 'awesome-cursorrules',
    skill_path: '.',
    github_url: 'https://github.com/PatrickJS/awesome-cursorrules',
    artifact_type: 'ruleset',
    category_slug: 'code-generation',
    github_stars: 37900,
    github_forks: 2800,
    license: 'CC0-1.0',
    weekly_installs: 8500,
    platforms: ['cursor', 'windsurf', 'continue-dev'],
    tags: ['cursorrules', 'ai-rules', 'coding-standards', 'editor-config', 'cursor'],
    difficulty: 'beginner',
    has_plugin: false,
    has_examples: true,
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: false,
    perm_network_access: false,
    perm_git_write: false,
    content: `# Awesome CursorRules

A curated list of .cursorrules files for the Cursor AI editor.

## What Are CursorRules?

\`.cursorrules\` files configure how Cursor's AI assistant behaves in your project. They define coding standards, framework conventions, and response patterns.

## Categories

- **Frontend** — React, Vue, Angular, Svelte, Next.js
- **Backend** — Node.js, Python, Go, Rust, Java
- **Mobile** — React Native, Flutter, Swift
- **DevOps** — Docker, Kubernetes, Terraform
- **Data** — Python data science, SQL, pandas

## Usage

1. Browse the rules directory for your stack
2. Copy the \`.cursorrules\` file to your project root
3. Cursor will automatically pick it up

## Example

\`\`\`
You are an expert in TypeScript, React, and Next.js App Router.

Key conventions:
- Use functional components with TypeScript interfaces
- Prefer server components by default
- Use Tailwind CSS for styling
\`\`\`
`,
    client_instructions: [
      {
        slug: 'cursor',
        instructions: '1. Browse rules at github.com/PatrickJS/awesome-cursorrules\n2. Find a .cursorrules file for your stack\n3. Copy it to your project root as .cursorrules\n4. Cursor will load it automatically on next session',
        primary: true,
      },
      {
        slug: 'windsurf',
        instructions: '1. Browse rules at github.com/PatrickJS/awesome-cursorrules\n2. Copy the rules content\n3. Add to .windsurfrules in your project root',
        primary: false,
      },
    ],
  },

  // ── OpenAPI Action ──────────────────────────────────────────
  {
    slug: 'chatgpt-retrieval-plugin',
    name: 'ChatGPT Retrieval Plugin',
    description: 'Official OpenAI plugin with OpenAPI schema for semantic search and retrieval-augmented generation (RAG) over personal or organizational documents.',
    owner: 'openai',
    repo: 'chatgpt-retrieval-plugin',
    skill_path: '.well-known',
    github_url: 'https://github.com/openai/chatgpt-retrieval-plugin',
    artifact_type: 'openapi_action',
    category_slug: 'research-analysis',
    github_stars: 21000,
    github_forks: 3600,
    license: 'MIT',
    weekly_installs: 3100,
    platforms: ['chatgpt', 'codex'],
    tags: ['openapi', 'rag', 'retrieval', 'embeddings', 'vector-search', 'chatgpt-plugin'],
    difficulty: 'intermediate',
    has_plugin: true,
    has_examples: true,
    perm_filesystem_read: true,
    perm_filesystem_write: false,
    perm_shell_exec: false,
    perm_network_access: true,
    perm_git_write: false,
    content: `# ChatGPT Retrieval Plugin

The official OpenAI retrieval plugin for ChatGPT. Provides an OpenAPI schema that enables semantic search over your documents.

## How It Works

1. **Upsert** documents into a vector database
2. **Query** with natural language via ChatGPT
3. **Retrieve** semantically relevant chunks
4. ChatGPT uses the results for grounded responses

## Supported Vector DBs

- Pinecone
- Weaviate
- Milvus
- Qdrant
- Redis
- Chroma
- And more...

## OpenAPI Schema

The plugin exposes these endpoints:
- \`POST /upsert\` — Add documents
- \`POST /query\` — Semantic search
- \`DELETE /delete\` — Remove documents

## Setup

\`\`\`bash
git clone https://github.com/openai/chatgpt-retrieval-plugin
pip install -r requirements.txt
# Configure your vector DB and API keys
python main.py
\`\`\`
`,
    client_instructions: [
      {
        slug: 'chatgpt',
        instructions: '1. Deploy the plugin server (see repo README)\n2. In ChatGPT → Settings → Plugins → Install unverified plugin\n3. Enter your deployed server URL\n4. ChatGPT will discover the OpenAPI schema automatically',
        primary: true,
      },
    ],
  },

  // ── Extension ───────────────────────────────────────────────
  {
    slug: 'continue-extension',
    name: 'Continue',
    description: 'Open-source VS Code and JetBrains extension that connects any LLM for autocomplete, chat, and inline editing with full model and context control.',
    owner: 'continuedev',
    repo: 'continue',
    skill_path: '.',
    github_url: 'https://github.com/continuedev/continue',
    artifact_type: 'extension',
    category_slug: 'code-generation',
    github_stars: 31400,
    github_forks: 2900,
    license: 'Apache-2.0',
    weekly_installs: 12000,
    platforms: ['vscode-copilot', 'continue-dev'],
    tags: ['vscode', 'jetbrains', 'autocomplete', 'ai-chat', 'open-source', 'llm'],
    difficulty: 'beginner',
    has_plugin: false,
    has_examples: true,
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: true,
    perm_git_write: false,
    content: `# Continue

The leading open-source AI code assistant for VS Code and JetBrains.

## Features

- **Chat** — Ask questions about your codebase
- **Autocomplete** — Tab-complete with any model
- **Edit** — Highlight code and give instructions
- **Actions** — Custom slash commands for repetitive tasks

## Supported Models

- Claude (Anthropic)
- GPT-4 (OpenAI)
- Gemini (Google)
- Ollama (local models)
- Any OpenAI-compatible API

## Install

### VS Code
Search "Continue" in the VS Code marketplace, or:
\`\`\`
ext install continue.continue
\`\`\`

### JetBrains
Search "Continue" in the JetBrains plugin marketplace.

## Configuration

Edit \`~/.continue/config.json\` to add your models:

\`\`\`json
{
  "models": [
    {
      "title": "Claude Sonnet",
      "provider": "anthropic",
      "model": "claude-sonnet-4-20250514",
      "apiKey": "your-key"
    }
  ]
}
\`\`\`
`,
    client_instructions: [
      {
        slug: 'vscode-copilot',
        instructions: 'Install from VS Code marketplace:\n\n1. Open VS Code\n2. Extensions → Search "Continue"\n3. Click Install\n4. Configure models in ~/.continue/config.json',
        primary: true,
      },
      {
        slug: 'continue-dev',
        instructions: 'Continue IS the client. Configure your models:\n\n1. Open ~/.continue/config.json\n2. Add your model providers and API keys\n3. Restart VS Code/JetBrains',
        primary: false,
      },
    ],
  },

  // ── Template Bundle ─────────────────────────────────────────
  {
    slug: 'n8n-ai-starter-kit',
    name: 'n8n Self-Hosted AI Starter Kit',
    description: 'Docker Compose template that sets up a complete local AI environment with n8n workflow automation, Ollama, Qdrant vector store, and PostgreSQL.',
    owner: 'n8n-io',
    repo: 'self-hosted-ai-starter-kit',
    skill_path: '.',
    github_url: 'https://github.com/n8n-io/self-hosted-ai-starter-kit',
    artifact_type: 'template_bundle',
    category_slug: 'devops-ci-cd',
    github_stars: 13700,
    github_forks: 2100,
    license: 'Apache-2.0',
    weekly_installs: 5400,
    platforms: ['claude-code', 'chatgpt', 'vscode-copilot', 'codex'],
    tags: ['docker', 'self-hosted', 'n8n', 'ai-workflows', 'starter-kit', 'local-ai'],
    difficulty: 'intermediate',
    has_plugin: false,
    has_examples: true,
    perm_filesystem_read: true,
    perm_filesystem_write: true,
    perm_shell_exec: true,
    perm_network_access: true,
    perm_git_write: false,
    content: `# n8n Self-Hosted AI Starter Kit

A Docker Compose template for setting up a complete self-hosted AI environment.

## What's Included

- **n8n** — Visual workflow automation
- **Ollama** — Local LLM inference
- **Qdrant** — Vector database for embeddings
- **PostgreSQL** — Persistent data storage

## Quick Start

\`\`\`bash
git clone https://github.com/n8n-io/self-hosted-ai-starter-kit
cd self-hosted-ai-starter-kit
docker compose --profile cpu up
\`\`\`

For GPU support:
\`\`\`bash
docker compose --profile gpu-nvidia up
\`\`\`

## Access Points

- n8n: http://localhost:5678
- Ollama API: http://localhost:11434
- Qdrant: http://localhost:6333

## Use Cases

- RAG chatbots over your documents
- AI-powered data pipelines
- Automated content generation
- Internal knowledge base assistants
`,
    client_instructions: [
      {
        slug: 'claude-code',
        instructions: 'Clone and start the stack:\n\ngit clone https://github.com/n8n-io/self-hosted-ai-starter-kit\ncd self-hosted-ai-starter-kit\ndocker compose --profile cpu up -d\n\nThen use Claude Code to build n8n workflows against the running services.',
        primary: true,
      },
      {
        slug: 'vscode-copilot',
        instructions: 'Clone the repo and open in VS Code:\n\ngit clone https://github.com/n8n-io/self-hosted-ai-starter-kit\ncode self-hosted-ai-starter-kit\n\nUse Copilot to customize docker-compose.yml and build n8n workflow JSON files.',
        primary: false,
      },
    ],
  },
];

async function getCategoryId(slug: string): Promise<string | null> {
  const { data } = await supabase.from('categories').select('id').eq('slug', slug).single();
  return data?.id ?? null;
}

async function seedSkill(example: SeedSkill): Promise<boolean> {
  console.log(`\nSeeding: ${example.name} (${example.artifact_type})`);

  const categoryId = await getCategoryId(example.category_slug);
  if (!categoryId) {
    console.log(`  ⚠ Category not found: ${example.category_slug}, inserting without category`);
  }

  const { data, error } = await supabase
    .from('skills')
    .upsert({
      slug: example.slug,
      name: example.name,
      description: example.description,
      owner: example.owner,
      repo: example.repo,
      skill_path: example.skill_path,
      github_url: example.github_url,
      content: example.content,
      status: 'published',
      featured: true,
      skill_type: 'skill',
      has_plugin: example.has_plugin,
      has_examples: example.has_examples,
      difficulty: example.difficulty,
      category_id: categoryId,
      author_username: example.owner,
      github_stars: example.github_stars,
      github_forks: example.github_forks,
      license: example.license,
      weekly_installs: example.weekly_installs,
      mdskills_upvotes: 0,
      mdskills_forks: 0,
      platforms: example.platforms,
      tags: example.tags,
      artifact_type: example.artifact_type,
      perm_filesystem_read: example.perm_filesystem_read,
      perm_filesystem_write: example.perm_filesystem_write,
      perm_shell_exec: example.perm_shell_exec,
      perm_network_access: example.perm_network_access,
      perm_git_write: example.perm_git_write,
    }, { onConflict: 'slug' })
    .select('id, slug, name')
    .single();

  if (error) {
    console.log(`  ✗ Error: ${error.message}`);
    return false;
  }
  console.log(`  ✓ Saved: ${data?.name} (${data?.slug})`);

  // Populate listing_clients
  if (data?.id && example.client_instructions.length > 0) {
    for (const ci of example.client_instructions) {
      const { data: client } = await supabase.from('clients').select('id').eq('slug', ci.slug).single();
      if (client) {
        await supabase.from('listing_clients').upsert({
          skill_id: data.id,
          client_id: client.id,
          install_instructions: ci.instructions,
          is_primary: ci.primary,
        }, { onConflict: 'skill_id,client_id' });
        console.log(`  ✓ Linked to ${ci.slug}`);
      } else {
        console.log(`  ⚠ Client not found: ${ci.slug}`);
      }
    }
  }

  return true;
}

async function main() {
  console.log('🌱 Seeding example listings (one per artifact type)...');

  let success = 0;
  let failed = 0;

  for (const example of EXAMPLES) {
    const ok = await seedSkill(example);
    if (ok) success++;
    else failed++;
  }

  console.log(`\n✅ Done! ${success} seeded, ${failed} failed.`);
  console.log('\nArtifact types seeded:');
  for (const e of EXAMPLES) {
    console.log(`  ${e.artifact_type.padEnd(18)} → ${e.name}`);
  }
}

main().catch(console.error);
