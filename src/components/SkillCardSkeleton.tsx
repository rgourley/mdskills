export function SkillCardSkeleton() {
  return (
    <div className="p-6 rounded-xl border border-neutral-200 bg-white animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-5 w-40 bg-neutral-200 rounded" />
        <div className="h-5 w-16 bg-neutral-100 rounded" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-4 w-full bg-neutral-100 rounded" />
        <div className="h-4 w-3/4 bg-neutral-100 rounded" />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="h-3 w-20 bg-neutral-50 rounded" />
        <div className="h-3 w-28 bg-neutral-50 rounded" />
      </div>
    </div>
  )
}

export function SkillGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkillCardSkeleton key={i} />
      ))}
    </div>
  )
}
