export const metadata = { title: "Staff sign in | Mossy Paws" };

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  return (
    <main className="mx-auto max-w-sm px-4 py-16 sm:py-24">
      <form action="/api/login" method="post" className="card p-6 sm:p-8 space-y-5">
        <div>
          <h1 className="text-3xl">Staff sign in</h1>
          <p className="mt-1 text-sm text-muted">Bookings and customer details are only visible to staff.</p>
        </div>
        <input type="hidden" name="next" value={next ?? "/admin"} />
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="field" aria-invalid={!!error} />
          {error && <p className="mt-1 text-sm text-bad" role="alert">That password did not match. Try again.</p>}
        </div>
        <button className="btn w-full">Sign in</button>
      </form>
    </main>
  );
}
