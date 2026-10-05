import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-bold text-accent">Page not found</p>
      <h1 className="mt-2 text-3xl">That page is not here</h1>
      <Link href="/" className="btn mt-6">Back to booking</Link>
    </main>
  );
}
