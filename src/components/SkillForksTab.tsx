import { GitFork } from 'lucide-react'

interface SkillForksTabProps {
  forksCount?: number
}

export function SkillForksTab({ forksCount = 0 }: SkillForksTabProps) {
  return (
    <div className="py-16 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-neutral-100 mb-4">
        <GitFork className="w-7 h-7 text-neutral-500" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">Fork Lineage</h3>
      <p className="text-neutral-600 max-w-md mx-auto mb-6">
        {forksCount > 0
          ? `This skill has ${forksCount} fork${forksCount === 1 ? '' : 's'}. Fork visualization coming soon.`
          : 'No forks yet. Be the first to fork and customize this skill.'}
      </p>
      <p className="text-sm text-neutral-500">Visual fork tree and fork list coming soon.</p>
    </div>
  )
}
