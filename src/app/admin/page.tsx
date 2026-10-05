import Link from "next/link";
import { findBookings } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookings | Mossy Paws staff" };

const STATUSES = ["", "confirmed", "pending", "completed", "cancelled", "no_show"];
const TONE: Record<string, string> = { confirmed: "text-ok", completed: "text-muted", pending: "text-warn", cancelled: "text-bad", no_show: "text-bad" };

type SP = { q?: string; status?: string; from?: string; to?: string; page?: string };

export default async function Admin({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const t0 = performance.now();
  const r = findBookings({ q: sp.q, status: sp.status || undefined, from: sp.from || undefined, to: sp.to || undefined, page: Number(sp.page) || 1 });
  const ms = performance.now() - t0;
  const link = (page: number) => `/admin?${new URLSearchParams({ ...(sp as Record<string, string>), page: String(page) })}`;
  const usd = (n: number) => "$" + n.toLocaleString("en-US");

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-8 py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl">Bookings</h1>
          <p className="mt-1 text-muted">{r.total.toLocaleString("en-US")} bookings match, ${r.revenue.toLocaleString("en-US")} booked. Loaded in {ms.toFixed(1)} ms.</p>
        </div>
        <form action="/api/logout" method="post"><button className="btn btn-ghost text-sm">Sign out</button></form>
      </div>

      <form className="mt-6 card p-4 grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto] items-end">
        <label className="text-sm">Search<input name="q" defaultValue={sp.q} placeholder="Customer, dog, groomer" className="field mt-1.5" /></label>
        <label className="text-sm">Status<select name="status" defaultValue={sp.status ?? ""} className="field mt-1.5">{STATUSES.map((s) => <option key={s} value={s}>{s ? s.replace("_", " ") : "Any"}</option>)}</select></label>
        <label className="text-sm">From<input type="date" name="from" defaultValue={sp.from} className="field mt-1.5" /></label>
        <label className="text-sm">To<input type="date" name="to" defaultValue={sp.to} className="field mt-1.5" /></label>
        <button className="btn">Filter</button>
      </form>

      {r.items.length === 0 ? (
        <div className="mt-6 card p-10 text-center">
          <p className="font-display text-2xl">No bookings match</p>
          <p className="mt-1 text-muted">Try a wider date range or clear the search.</p>
          <Link href="/admin" className="btn btn-ghost mt-5">Clear filters</Link>
        </div>
      ) : (
        <>
          <div className="mt-6 card overflow-hidden hidden md:block">
            <table className="w-full text-left text-[15px]">
              <thead className="bg-surface-2 text-sm text-muted">
                <tr>{["When", "Customer", "Dog", "Service", "Groomer", "Status", "Price"].map((h) => <th key={h} className={`px-4 py-3 font-semibold ${h === "Price" ? "text-right" : ""}`}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {r.items.map((b) => (
                  <tr key={b.id} className="border-t border-line">
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{b.date} <span className="text-muted">{b.time}</span></td>
                    <td className="px-4 py-3">{b.customerName}</td>
                    <td className="px-4 py-3 text-muted">{b.dog}</td>
                    <td className="px-4 py-3">{b.serviceName}</td>
                    <td className="px-4 py-3">{b.staff}</td>
                    <td className="px-4 py-3"><span className={`font-bold capitalize ${TONE[b.status] ?? ""}`}>{b.status.replace("_", " ")}</span></td>
                    <td className="px-4 py-3 text-right font-semibold">${b.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-6 grid gap-3 md:hidden">
            {r.items.map((b) => (
              <li key={b.id} className="card p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{b.customerName}</p>
                  <span className={`font-bold capitalize ${TONE[b.status] ?? ""}`}>{b.status.replace("_", " ")}</span>
                </div>
                <p className="text-sm text-muted mt-0.5">{b.dog}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span>{b.serviceName} · {b.staff}</span>
                  <span>{b.date} {b.time}, ${b.price}</span>
                </div>
              </li>
            ))}
          </ul>
          <nav className="mt-6 flex items-center justify-between text-sm">
            {r.page > 1 ? <Link className="btn btn-ghost" href={link(r.page - 1)}>Previous</Link> : <span />}
            <span className="text-muted">{((r.page - 1) * r.pageSize + 1).toLocaleString("en-US")} to {Math.min(r.page * r.pageSize, r.total).toLocaleString("en-US")} of {r.total.toLocaleString("en-US")}</span>
            {r.page < r.pages ? <Link className="btn btn-ghost" href={link(r.page + 1)}>Next</Link> : <span />}
          </nav>
        </>
      )}
    </main>
  );
}
