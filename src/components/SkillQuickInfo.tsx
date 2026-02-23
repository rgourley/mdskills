import Link from 'next/link'
import { Github, Star, GitFork, Puzzle, FolderOpen, FolderEdit, Terminal, Globe, GitBranch, Info } from 'lucide-react'
import type { Skill } from '@/lib/skills'

const ARTIFACT_LABELS: Record<string, string> = {
  skill_pack: 'Agent Skill',
  mcp_server: 'MCP Server',
  workflow_pack: 'Workflow Pack',
  ruleset: 'Rules',
  openapi_action: 'OpenAPI Action',
  extension: 'Extension',
  template_bundle: 'Starter Kit',
  plugin: 'Plugin',
}

const FORMAT_INFO: Record<string, { label: string; specPath?: string }> = {
  skill_md: { label: 'SKILL.md', specPath: '/specs/skill-md' },
  agents_md: { label: 'AGENTS.md', specPath: '/specs/agents-md' },
  claude_md: { label: 'CLAUDE.md', specPath: '/specs/claude-md' },
  cursorrules: { label: '.cursorrules', specPath: '/specs/cursorrules' },
  copilot_instructions: { label: 'copilot-instructions.md' },
  gemini_md: { label: 'GEMINI.md' },
  clinerules: { label: '.clinerules' },
  windsurf_rules: { label: '.windsurfrules' },
  mdc: { label: '.mdc', specPath: '/specs/cursorrules' },
}

interface SkillQuickInfoProps {
  skill: Skill
}

export function SkillQuickInfo({ skill }: SkillQuickInfoProps) {
  const hasAnyPermission = skill.permFilesystemRead || skill.permFilesystemWrite || skill.permShellExec || skill.permNetworkAccess || skill.permGitWrite

  if (!skill.hasPlugin && !skill.categoryName && !skill.license && skill.githubStars == null && !skill.artifactType && !hasAnyPermission) return null

  return (
    <aside className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-neutral-900">Quick Info</h2>
      <dl className="space-y-3 text-sm">
        {/* Artifact type */}
        {skill.artifactType && (
          <div>
            <dt className="text-neutral-500">Type</dt>
            <dd className="font-medium text-neutral-900">
              {ARTIFACT_LABELS[skill.artifactType] ?? skill.artifactType}
              {skill.hasPlugin && skill.artifactType !== 'plugin' && ' + Plugin'}
            </dd>
          </div>
        )}
        {!skill.artifactType && skill.hasPlugin && (
          <div>
            <dt className="text-neutral-500">Type</dt>
            <dd className="font-medium text-neutral-900">Skill + Plugin</dd>
          </div>
        )}
        {skill.formatStandard && skill.formatStandard !== 'skill_md' && skill.formatStandard !== 'generic' && FORMAT_INFO[skill.formatStandard] && (
          <div>
            <dt className="text-neutral-500">Format</dt>
            <dd className="font-medium text-neutral-900">
              {FORMAT_INFO[skill.formatStandard].specPath ? (
                <Link href={FORMAT_INFO[skill.formatStandard].specPath!} className="text-blue-600 hover:text-blue-700">
                  {FORMAT_INFO[skill.formatStandard].label}
                </Link>
              ) : (
                FORMAT_INFO[skill.formatStandard].label
              )}
            </dd>
          </div>
        )}
        {skill.categoryName && (
          <div>
            <dt className="text-neutral-500">Category</dt>
            <dd className="font-medium text-neutral-900">{skill.categoryName}</dd>
          </div>
        )}
        {skill.difficulty && (
          <div>
            <dt className="text-neutral-500">Difficulty</dt>
            <dd className="font-medium text-neutral-900 capitalize">{skill.difficulty}</dd>
          </div>
        )}
        {skill.license && (
          <div>
            <dt className="text-neutral-500">License</dt>
            <dd className="font-medium text-neutral-900">{skill.license}</dd>
          </div>
        )}
        {skill.reviewQualityScore != null && (
          <div>
            <dt className="text-neutral-500 flex items-center gap-1">
              Skill Advisor
              <Link href="/docs/skill-advisor" className="text-neutral-400 hover:text-neutral-600 transition-colors" title="How we review skills">
                <Info className="w-3 h-3" />
              </Link>
            </dt>
            <dd className="font-medium">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                skill.reviewQualityScore >= 7
                  ? 'bg-emerald-100 text-emerald-700'
                  : skill.reviewQualityScore >= 4
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {skill.reviewQualityScore}
              </span>
            </dd>
          </div>
        )}
        {(skill.githubStars != null || skill.githubForks != null) && (
          <div>
            <dt className="text-neutral-500 flex items-center gap-1">
              <Github className="w-4 h-4" /> GitHub
            </dt>
            <dd className="flex flex-wrap gap-3 mt-1">
              {skill.githubStars != null && (
                <span className="flex items-center gap-1 text-neutral-700">
                  <Star className="w-4 h-4" /> {skill.githubStars >= 1000 ? `${(skill.githubStars / 1000).toFixed(1)}k` : skill.githubStars} stars
                </span>
              )}
              {skill.githubForks != null && (
                <span className="flex items-center gap-1 text-neutral-700">
                  <GitFork className="w-4 h-4" /> {skill.githubForks} forks
                </span>
              )}
            </dd>
          </div>
        )}
        {(skill.hasPlugin || skill.artifactType === 'plugin') && (
          <div>
            <dt className="text-neutral-500 flex items-center gap-1">
              <Puzzle className="w-4 h-4" /> Best experience
            </dt>
            <dd className="font-medium text-neutral-900">Claude Code (plugin)</dd>
          </div>
        )}
      </dl>

      {/* Permissions */}
      {hasAnyPermission && (
        <div className="pt-3 border-t border-neutral-200">
          <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Permissions</h3>
          <ul className="space-y-1.5">
            {skill.permFilesystemRead && (
              <li className="flex items-center gap-2 text-sm text-neutral-700">
                <FolderOpen className="w-3.5 h-3.5 text-neutral-500" />
                Filesystem Read
              </li>
            )}
            {skill.permFilesystemWrite && (
              <li className="flex items-center gap-2 text-sm text-neutral-700">
                <FolderEdit className="w-3.5 h-3.5 text-amber-500" />
                Filesystem Write
              </li>
            )}
            {skill.permShellExec && (
              <li className="flex items-center gap-2 text-sm text-neutral-700">
                <Terminal className="w-3.5 h-3.5 text-red-500" />
                Shell Execution
              </li>
            )}
            {skill.permNetworkAccess && (
              <li className="flex items-center gap-2 text-sm text-neutral-700">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                Network Access
              </li>
            )}
            {skill.permGitWrite && (
              <li className="flex items-center gap-2 text-sm text-neutral-700">
                <GitBranch className="w-3.5 h-3.5 text-orange-500" />
                Git Write
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Link
          href="/docs/install-skills"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Install guide
        </Link>
        {skill.githubUrl && (
          <a
            href={skill.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View on GitHub
          </a>
        )}
      </div>
    </aside>
  )
}
