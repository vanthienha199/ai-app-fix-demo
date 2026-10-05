"use client";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <div className="card p-8 text-center" role="alert">
        <p className="text-2xl">The bookings did not load</p>
        <p className="mt-2 text-muted">Nothing was lost. This is usually a short network problem.</p>
        <button className="btn mt-6" onClick={reset}>Try again</button>
      </div>
    </main>
  );
}
