export function OverviewSkeleton() {
  return (
    <div className="mt-8 space-y-6" aria-hidden="true">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface-card p-6">
            <div className="ui-skeleton mb-4 h-3 w-24" />
            <div className="ui-skeleton h-10 w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="surface-card h-80 lg:col-span-3" />
        <div className="surface-card h-80" />
      </div>

      <div className="surface-card h-72" />
    </div>
  );
}

export function TableSkeleton({
  rows = 8,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="surface-card overflow-hidden p-0" aria-hidden="true">
      <div className="grid grid-cols-1 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
        <div className="ui-skeleton h-4 w-40" />
      </div>
      <div className="space-y-0">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 border-b border-slate-200 px-4 py-3 dark:border-slate-800"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <div
                key={`${rowIndex}-${columnIndex}`}
                className="ui-skeleton h-4 w-full"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
