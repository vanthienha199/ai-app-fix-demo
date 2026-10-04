import { Suspense } from "react";
import BookingForm from "@/components/BookingForm";
import { listServices } from "@/lib/db";

export default async function Home({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const services = listServices();
  const preselect = services.some((s) => s.id === service) ? service! : "full";
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-8 py-10 sm:py-16 grid gap-10 lg:grid-cols-[1fr_1.05fr] items-start">
      <section>
        <p className="font-mono text-xs tracking-[.14em] uppercase text-accent">Grooming in Larkspur Heights</p>
        <h1 className="mt-3 font-display font-extrabold text-4xl sm:text-6xl leading-[1.02] tracking-tight">A calm, clean pup in about an hour.</h1>
        <p className="mt-4 text-muted text-lg max-w-md">Pick a service and a time. We confirm by email and remind you the day before.</p>
        <ul className="mt-8 card divide-y divide-[var(--line)]">
          {services.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted">{s.minutes} min</p>
              </div>
              <p className="num text-lg">${s.price}</p>
            </li>
          ))}
        </ul>
      </section>
      <Suspense fallback={<div className="card p-6"><div className="skeleton h-80" /></div>}>
        <BookingForm services={services} preselect={preselect} />
      </Suspense>
    </main>
  );
}
