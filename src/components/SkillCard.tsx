import Link from 'next/link'
import { Package, Star } from 'lucide-react'
import type { Skill } from '@/lib/skills'

interface SkillCardProps {
  skill: Skill
}

export function SkillCard({ skill }: SkillCardProps) {
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
          <h3 className="font-semibold text-neutral-900 truncate group-hover:text-blue-600 transition-colors">
            {skill.name}
          </h3>
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
