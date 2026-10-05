import { Suspense } from "react";
import BookingForm from "@/components/BookingForm";
import { listServices } from "@/lib/db";

export default async function Home({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const services = listServices();
  const preselect = services.some((s) => s.id === service) ? service! : "full";
  return (
    <main className="mx-auto max-w-5xl px-5 sm:px-8 pt-4 pb-10">
      <h1 className="text-5xl sm:text-7xl leading-[0.95] max-w-3xl">Book a groom in three steps</h1>
      <p className="mt-4 text-lg text-muted max-w-xl">Rosa, Dev, Kit and Amara groom about 50 dogs a week in Larkspur Heights. Pick your dog, a service and a time.</p>
      <div className="mt-8">
        <Suspense fallback={<div className="skeleton h-96" />}>
          <BookingForm services={services} preselect={preselect} />
        </Suspense>
      </div>
    </main>
  );
}
