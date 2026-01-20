export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-zinc-200 sm:h-12 sm:w-12" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-zinc-200" />
          <div className="h-3 w-1/2 rounded bg-zinc-200" />
        </div>
      </div>
      <div className="mb-4 space-y-2">
        <div className="h-3 w-full rounded bg-zinc-200" />
        <div className="h-3 w-5/6 rounded bg-zinc-200" />
        <div className="h-3 w-4/6 rounded bg-zinc-200" />
      </div>
      <div className="mb-4 flex gap-1.5">
        <div className="h-6 w-16 rounded-full bg-zinc-200" />
        <div className="h-6 w-20 rounded-full bg-zinc-200" />
        <div className="h-6 w-14 rounded-full bg-zinc-200" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-20 rounded-lg bg-zinc-200" />
        <div className="h-8 w-20 rounded-lg bg-zinc-200" />
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-zinc-200/70">
      <div className="border-b border-zinc-200 bg-zinc-50 p-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="h-4 w-24 rounded bg-zinc-200" />
          <div className="h-4 w-32 rounded bg-zinc-200" />
          <div className="h-4 w-28 rounded bg-zinc-200" />
          <div className="h-4 w-20 rounded bg-zinc-200" />
          <div className="h-4 w-24 rounded bg-zinc-200" />
        </div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border-b border-zinc-100 p-4">
          <div className="grid grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-zinc-200" />
              <div className="h-3 w-40 rounded bg-zinc-200" />
            </div>
            <div className="h-4 w-28 rounded bg-zinc-200" />
            <div className="h-4 w-24 rounded bg-zinc-200" />
            <div className="h-6 w-16 rounded-full bg-zinc-200" />
            <div className="flex gap-1">
              <div className="h-6 w-6 rounded bg-zinc-200" />
              <div className="h-6 w-6 rounded bg-zinc-200" />
              <div className="h-6 w-6 rounded bg-zinc-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="animate-pulse space-y-6 rounded-xl bg-white/90 p-6 shadow-lg ring-1 ring-zinc-200/70">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-zinc-200" />
        <div className="h-4 w-64 rounded bg-zinc-200" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-zinc-200" />
          <div className="h-10 w-full rounded-xl bg-zinc-200" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-zinc-200" />
          <div className="h-10 w-full rounded-xl bg-zinc-200" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-zinc-200" />
        <div className="h-24 w-full rounded-xl bg-zinc-200" />
      </div>
      <div className="h-10 w-32 rounded-xl bg-zinc-200" />
    </div>
  );
}
