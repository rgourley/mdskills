import Link from 'next/link'
import { Package, Star, Puzzle, Server, Workflow, Shield } from 'lucide-react'
import type { Skill } from '@/lib/skills'

interface SkillCardProps {
  skill: Skill
}

const ARTIFACT_BADGE: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  mcp_server: { label: 'MCP Server', icon: Server, color: 'bg-blue-50 text-blue-700' },
  workflow_pack: { label: 'Workflow', icon: Workflow, color: 'bg-green-50 text-green-700' },
  ruleset: { label: 'Rules', icon: Shield, color: 'bg-amber-50 text-amber-700' },
  openapi_action: { label: 'OpenAPI', icon: Package, color: 'bg-purple-50 text-purple-700' },
  extension: { label: 'Extension', icon: Package, color: 'bg-teal-50 text-teal-700' },
  template_bundle: { label: 'Starter Kit', icon: Package, color: 'bg-pink-50 text-pink-700' },
}

export function SkillCard({ skill }: SkillCardProps) {
  const artifactInfo = skill.artifactType && skill.artifactType !== 'skill_pack'
    ? ARTIFACT_BADGE[skill.artifactType]
    : null

  return (
    <Link
      href={`/skills/${skill.slug}`}
      className="group block p-6 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-200 transition-colors">
          <Package className="w-5 h-5 text-neutral-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-neutral-900 truncate group-hover:text-blue-600 transition-colors">
              {skill.name}
            </h3>
            {artifactInfo && (
              <span className={`flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${artifactInfo.color}`}>
                <artifactInfo.icon className="w-3 h-3" /> {artifactInfo.label}
              </span>
            )}
            {skill.hasPlugin && (
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-700">
                <Puzzle className="w-3 h-3" /> Plugin
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
            {skill.description}
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              {skill.weeklyInstalls.toLocaleString()} weekly
            </span>
            <span>{skill.owner}/{skill.repo}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
