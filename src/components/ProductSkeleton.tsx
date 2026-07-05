const SKELETON_CARD_COUNT = 6;

export function ProductSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Učitavanje proizvoda"
    >
      <span className="sr-only">Učitavanje proizvoda...</span>

      <div
        aria-hidden="true"
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from(
          { length: SKELETON_CARD_COUNT },
          (_, index) => (
            <article
              key={index}
              className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm"
            >
              <div className="skeleton-shimmer h-52 w-full" />

              <div className="space-y-4 p-5">
                <div className="skeleton-shimmer h-5 w-3/4" />

                <div className="skeleton-shimmer h-5 w-1/3" />

                <div className="space-y-2">
                  <div className="skeleton-shimmer h-4 w-full" />
                  <div className="skeleton-shimmer h-4 w-5/6" />
                  <div className="skeleton-shimmer h-4 w-2/3" />
                </div>

                <div className="skeleton-shimmer h-4 w-1/2" />
              </div>
            </article>
          ),
        )}
      </div>
    </div>
  );
}