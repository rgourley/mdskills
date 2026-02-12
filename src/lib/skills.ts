export interface Skill {
  id: string
  slug: string
  name: string
  description: string
  owner: string
  repo: string
  skillPath: string
  weeklyInstalls: number
  tags: string[]
  platforms: string[]
  upvotes?: number
  forksCount?: number
  commentsCount?: number
  updatedAt?: string
  skillContent?: string
}

// Seed/mock data - replace with Supabase when ready
const MOCK_SKILLS: Skill[] = [
  {
    id: '1',
    slug: 'find-skills',
    name: 'find-skills',
    description: 'Discover and install skills from the open agent skills ecosystem.',
    owner: 'vercel-labs',
    repo: 'skills',
    skillPath: 'find-skills',
    weeklyInstalls: 193300,
    tags: ['discovery', 'search', 'skills'],
    platforms: ['claude-code', 'codex', 'gemini-cli', 'github-copilot'],
  },
  {
    id: '2',
    slug: 'vercel-react-best-practices',
    name: 'vercel-react-best-practices',
    description: 'React and Next.js performance optimization guidelines from Vercel Engineering.',
    owner: 'vercel-labs',
    repo: 'agent-skills',
    skillPath: 'vercel-react-best-practices',
    weeklyInstalls: 45000,
    tags: ['react', 'nextjs', 'performance'],
    platforms: ['claude-code', 'codex'],
  },
  {
    id: '3',
    slug: 'security-pr-review',
    name: 'security-pr-review',
    description: 'Review pull requests for security vulnerabilities and best practices.',
    owner: 'vercel-labs',
    repo: 'agent-skills',
    skillPath: 'security-pr-review',
    weeklyInstalls: 28000,
    tags: ['security', 'code-review', 'pr'],
    platforms: ['claude-code', 'codex', 'cursor'],
    upvotes: 234,
    forksCount: 23,
    commentsCount: 8,
    updatedAt: '2 days ago',
    skillContent: `# Security PR Review

## Description
Automated security analysis for pull requests. Review code changes for common vulnerabilities and security best practices.

## When to Use This Skill

Use this skill when the user:
- Asks for a security review of a pull request
- Wants to check for vulnerabilities before merging
- Requests analysis of authentication or authorization changes
- Needs help identifying SQL injection, XSS, or other OWASP top 10 issues

## Instructions

Review the pull request for:

### SQL Injection
- Unparameterized queries
- String concatenation in SQL
- User input passed directly to database calls

### XSS Attack Vectors
- Unsanitized user input in HTML
- dangerouslySetInnerHTML usage
- DOM-based XSS patterns

### Authentication & Authorization
- Session fixation vulnerabilities
- Insecure direct object references
- Missing authorization checks

### Sensitive Data Exposure
- Hardcoded secrets or credentials
- Logging of sensitive information
- Insecure transmission of PII

## Output Format

Provide findings in a structured format:
1. **Severity** (Critical/High/Medium/Low)
2. **Location** (file:line)
3. **Issue** (brief description)
4. **Recommendation** (how to fix)
5. **References** (CWE, OWASP links if applicable)`,
  },
  {
    id: '4',
    slug: 'api-integration',
    name: 'api-integration',
    description: 'Create and test API integrations with common patterns and authentication.',
    owner: 'composio',
    repo: 'awesome-claude-skills',
    skillPath: 'api-integration',
    weeklyInstalls: 12000,
    tags: ['api', 'integration', 'testing'],
    platforms: ['claude-code', 'codex'],
  },
  {
    id: '5',
    slug: 'documentation-generator',
    name: 'documentation-generator',
    description: 'Generate and maintain documentation from code and comments.',
    owner: 'composio',
    repo: 'awesome-claude-skills',
    skillPath: 'documentation-generator',
    weeklyInstalls: 8500,
    tags: ['docs', 'documentation', 'markdown'],
    platforms: ['claude-code', 'codex', 'cursor'],
  },
  {
    id: '6',
    slug: 'test-generator',
    name: 'test-generator',
    description: 'Generate unit and integration tests for your codebase.',
    owner: 'vercel-labs',
    repo: 'agent-skills',
    skillPath: 'test-generator',
    weeklyInstalls: 32000,
    tags: ['testing', 'jest', 'playwright'],
    platforms: ['claude-code', 'codex'],
  },
]

export async function getFeaturedSkills(): Promise<Skill[]> {
  // TODO: Fetch from Supabase
  return MOCK_SKILLS.slice(0, 6)
}

export async function getSkills(query?: string, tags?: string[]): Promise<Skill[]> {
  // TODO: Fetch from Supabase with filters
  let skills = [...MOCK_SKILLS]
  if (query) {
    const q = query.toLowerCase()
    skills = skills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    )
  }
  if (tags?.length) {
    skills = skills.filter((s) => tags.some((t) => s.tags.includes(t)))
  }
  return skills
}

export async function getSkillBySlug(slug: string): Promise<Skill | null> {
  // TODO: Fetch from Supabase
  const skill = MOCK_SKILLS.find((s) => s.slug === slug) ?? null
  if (skill && !skill.skillContent) {
    skill.skillContent = `# ${skill.name}

## Description
${skill.description}

## When to Use This Skill

Use this skill when the user needs help with tasks related to this domain.

## Instructions

Add your instructions here.`
  }
  return skill
}
