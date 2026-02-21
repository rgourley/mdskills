import { SkillGridSkeleton } from '@/components/SkillCardSkeleton'

interface ListingPageSkeletonProps {
  titleWidth?: string
  descWidth?: string
}

export function ListingPageSkeleton({ titleWidth = 'w-40', descWidth = 'w-96' }: ListingPageSkeletonProps) {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Title + description skeleton */}
        <div className="mb-8">
          <div className={`h-9 ${titleWidth} bg-neutral-200 rounded animate-pulse`} />
          <div className={`mt-3 h-5 ${descWidth} max-w-full bg-neutral-100 rounded animate-pulse`} />
        </div>

        {/* Search bar skeleton */}
        <div className="h-12 w-full bg-neutral-100 rounded-lg animate-pulse" />

        {/* Inline filters skeleton */}
        <div className="mt-6 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-28 bg-neutral-100 rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Count skeleton */}
        <div className="mt-8">
          <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse mb-4" />
          <SkillGridSkeleton count={12} />
        </div>
      </div>
    </div>
  )
}
