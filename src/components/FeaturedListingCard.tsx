import { Link } from '@/i18n/navigation'
import { Star, Server, Puzzle, Shield, Workflow, Wrench, Package } from 'lucide-react'
import { getSkillPath } from '@/lib/skills'
import type { Skill } from '@/lib/skills'

const ARTIFACT_BADGE: Record<string, { label: string; icon: React.ElementType }> = {
  skill_pack: { label: 'Skill', icon: Package },
  mcp_server: { label: 'MCP Server', icon: Server },
  plugin: { label: 'Plugin', icon: Puzzle },
  ruleset: { label: 'Rules', icon: Shield },
  workflow_pack: { label: 'Workflow', icon: Workflow },
  extension: { label: 'Extension', icon: Package },
  tool: { label: 'Tool', icon: Wrench },
}

export function FeaturedListingCard({ skill }: { skill: Skill }) {
  const badge = skill.artifactType ? ARTIFACT_BADGE[skill.artifactType] : null

  return (
    <Link
      href={getSkillPath(skill.slug, skill.artifactType)}
      className="hidden lg:block p-4 rounded-xl border border-amber-200/60 bg-white hover:border-amber-300 hover:shadow-lg transition-all duration-200 group"
    >
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-700">
          <Star className="w-3 h-3" /> Featured
        </span>
        {badge && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-600">
            <badge.icon className="w-3 h-3" /> {badge.label}
          </span>
        )}
        {skill.reviewQualityScore != null && (
          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
            skill.reviewQualityScore >= 7
              ? 'bg-emerald-100 text-emerald-700'
              : skill.reviewQualityScore >= 4
              ? 'bg-amber-100 text-amber-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {skill.reviewQualityScore}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-sm text-neutral-900 truncate group-hover:text-blue-600 transition-colors">
        {skill.name}
      </h3>
      <p className="mt-0.5 text-xs text-neutral-500 line-clamp-2">
        {skill.description}
      </p>
    </Link>
  )
}
