import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-2 font-display font-bold text-3xl">That page is not here</h1>
      <Link href="/" className="btn mt-6">Back to booking</Link>
    </main>
  );
}
