export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-8 py-8 sm:py-12" aria-busy="true">
      <div className="skeleton h-12 w-56" />
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">{Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-20" />)}</div>
      <div className="mt-6 skeleton h-20" />
      <div className="mt-6 space-y-2">{Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton h-11" />)}</div>
    </main>
  );
}
