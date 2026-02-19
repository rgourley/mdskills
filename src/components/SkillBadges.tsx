import Link from 'next/link'
import { Puzzle, Palette, Sparkles, Server, Workflow, Shield, Plug, FileCode, Package } from 'lucide-react'
import type { Skill } from '@/lib/skills'

interface SkillBadgesProps {
  skill: Skill
}

const ARTIFACT_BADGE: Record<string, { label: string; icon: React.ElementType }> = {
  mcp_server: { label: 'MCP Server', icon: Server },
  workflow_pack: { label: 'Workflow', icon: Workflow },
  ruleset: { label: 'Rules', icon: Shield },
  openapi_action: { label: 'OpenAPI Action', icon: Plug },
  extension: { label: 'Extension', icon: FileCode },
  template_bundle: { label: 'Starter Kit', icon: Package },
}

export function SkillBadges({ skill }: SkillBadgesProps) {
  const badges: { label: string; icon?: React.ElementType; href?: string; color?: string }[] = []

  // Artifact type badge (only for non-default types)
  if (skill.artifactType && skill.artifactType !== 'skill_pack') {
    const info = ARTIFACT_BADGE[skill.artifactType]
    if (info) {
      badges.push({ label: info.label, icon: info.icon, color: 'bg-blue-50 text-blue-700' })
    }
  }

  if (skill.hasPlugin) {
    badges.push({ label: 'SKILL + PLUGIN', icon: Puzzle })
  }
  if (skill.categoryName) {
    badges.push({
      label: skill.categoryName,
      icon: Palette,
      href: `/skills?category=${skill.categorySlug || skill.categoryName}`,
    })
  }
  if (skill.difficulty) {
    const d = skill.difficulty.toLowerCase()
    const label = d === 'beginner' ? 'Beginner friendly' : d === 'intermediate' ? 'Intermediate' : d === 'advanced' ? 'Advanced' : skill.difficulty
    badges.push({ label, icon: Sparkles })
  }

  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      {badges.map((b) => {
        const Icon = b.icon
        const content = (
          <>
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span>{b.label}</span>
          </>
        )
        const className = `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${b.color || 'bg-neutral-100 text-neutral-700'}`
        if (b.href) {
          return (
            <Link key={b.label} href={b.href} className={`${className} hover:bg-neutral-200 transition-colors`}>
              {content}
            </Link>
          )
        }
        return (
          <span key={b.label} className={className}>
            {content}
          </span>
        )
      })}
    </div>
  )
}
