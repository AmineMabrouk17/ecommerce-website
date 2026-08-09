export default function ProductDetailLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-6 h-4 w-40 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-xl bg-muted" />
        <div className="flex flex-col gap-6">
          <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-12 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </main>
  );
}
