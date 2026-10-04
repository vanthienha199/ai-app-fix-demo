import type { Booking, BookingRow, Customer, Service } from "./types";

export type Query = { q?: string; status?: string; from?: string; to?: string; page?: number; pageSize?: number };
export const STAFF = ["Rosa", "Dev", "Kit", "Amara"];
export const SLOT_TIMES = Array.from({ length: 36 }, (_, i) => `${String(8 + Math.floor(i / 4)).padStart(2, "0")}:${String((i % 4) * 15).padStart(2, "0")}`);

export function buildIndex(bookings: Booking[], customerList: Customer[], serviceList: Service[]) {
  const customers = new Map(customerList.map((c) => [c.id, c]));
  const services = new Map(serviceList.map((s) => [s.id, s]));
  const join = (b: Booking): BookingRow => {
    const c = customers.get(b.customerId);
    return { ...b, customerName: c?.name ?? "Unknown", dog: c?.dog ?? "", serviceName: services.get(b.service)?.name ?? b.service };
  };
  const rows: BookingRow[] = bookings.map(join).sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
  const bySlot = new Map<string, Set<string>>();
  for (const r of rows) if (r.status !== "cancelled") (bySlot.get(r.date + " " + r.time) ?? bySlot.set(r.date + " " + r.time, new Set()).get(r.date + " " + r.time)!).add(r.staff);
  const search = new Map(rows.map((r) => [r.id, `${r.customerName} ${r.dog} ${r.serviceName} ${r.staff} ${r.id}`.toLowerCase()]));

  const firstOnOrBefore = (date: string) => {
    let lo = 0, hi = rows.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (rows[mid].date > date) lo = mid + 1; else hi = mid; }
    return lo;
  };
  const firstBefore = (date: string) => {
    let lo = 0, hi = rows.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (rows[mid].date >= date) lo = mid + 1; else hi = mid; }
    return lo;
  };

  return {
    customers,
    services,
    rows,
    slotTaken: (date: string, time: string, staff: string) => bySlot.get(date + " " + time)?.has(staff) ?? false,
    availableSlots: (date: string) => SLOT_TIMES.filter((t) => (bySlot.get(date + " " + t)?.size ?? 0) < STAFF.length),
    insert(b: Booking) {
      const row = join(b);
      rows.splice(firstOnOrBefore(row.date), 0, row);
      (bySlot.get(b.date + " " + b.time) ?? bySlot.set(b.date + " " + b.time, new Set()).get(b.date + " " + b.time)!).add(b.staff);
      search.set(row.id, `${row.customerName} ${row.dog} ${row.serviceName} ${row.staff} ${row.id}`.toLowerCase());
      return row;
    },
    range(from?: string, to?: string) {
      const start = to ? firstOnOrBefore(to) : 0;
      const end = from ? firstBefore(from) : rows.length;
      return { start, end };
    },
    search,
  };
}

export type BookingIndex = ReturnType<typeof buildIndex>;

export function queryBookings(index: BookingIndex, q: Query) {
  const pageSize = Math.min(Math.max(q.pageSize ?? 25, 1), 100);
  const page = Math.max(q.page ?? 1, 1);
  const { start, end } = index.range(q.from, q.to);
  const needle = q.q?.trim().toLowerCase();
  const items: BookingRow[] = [];
  let total = 0, revenue = 0;
  for (let i = start; i < end; i++) {
    const r = index.rows[i];
    if (q.status && r.status !== q.status) continue;
    if (needle && !index.search.get(r.id)!.includes(needle)) continue;
    total++;
    if (r.status === "completed" || r.status === "confirmed") revenue += r.price;
    if (total > (page - 1) * pageSize && items.length < pageSize) items.push(r);
  }
  return { items, total, revenue, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
}
