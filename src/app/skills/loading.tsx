export default function SkillsLoading() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <div className="h-9 w-32 bg-neutral-200 rounded animate-pulse" />
          <div className="mt-3 h-5 w-80 bg-neutral-100 rounded animate-pulse" />
        </div>

        {/* Search bar skeleton */}
        <div className="h-12 w-full bg-neutral-100 rounded-lg animate-pulse" />

        <div className="mt-10 flex flex-col lg:flex-row gap-10">
          {/* Filter sidebar skeleton */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse mb-3" />
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-7 w-20 bg-neutral-100 rounded-md animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Grid skeleton */}
          <div className="flex-1 min-w-0">
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-6 rounded-xl border border-neutral-200 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-3/4 bg-neutral-200 rounded animate-pulse" />
                      <div className="h-4 w-full bg-neutral-100 rounded animate-pulse" />
                      <div className="h-4 w-2/3 bg-neutral-100 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-neutral-50 rounded animate-pulse mt-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
