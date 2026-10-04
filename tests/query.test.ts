import { describe, expect, it } from "vitest";
import bookings from "@/data/bookings.json";
import customers from "@/data/customers.json";
import services from "@/data/services.json";
import { buildIndex, queryBookings } from "@/lib/query";
import type { Booking, Customer, Service } from "@/lib/types";

const index = buildIndex(bookings as Booking[], customers as Customer[], services as Service[]);
const cmap = new Map((customers as Customer[]).map((c) => [c.id, c]));

function naive(q: { q?: string; status?: string; from?: string; to?: string }) {
  return (bookings as Booking[]).filter((b) => {
    if (q.from && b.date < q.from) return false;
    if (q.to && b.date > q.to) return false;
    if (q.status && b.status !== q.status) return false;
    if (q.q) {
      const c = cmap.get(b.customerId)!;
      const svc = (services as Service[]).find((s) => s.id === b.service)!;
      if (!`${c.name} ${c.dog} ${svc.name} ${b.staff} ${b.id}`.toLowerCase().includes(q.q.toLowerCase())) return false;
    }
    return true;
  });
}

describe("queryBookings", () => {
  const cases = [
    {},
    { status: "cancelled" },
    { from: "2025-06-01", to: "2025-06-30" },
    { q: "biscuit" },
    { q: "rosa", status: "completed", from: "2026-01-01" },
    { to: "2024-12-31", q: "corgi" },
    { from: "2026-10-05", status: "confirmed" },
  ];
  for (const c of cases) {
    it(`matches a full scan for ${JSON.stringify(c)}`, () => {
      expect(queryBookings(index, c).total).toBe(naive(c).length);
    });
  }

  it("returns one page of 25 rows, newest first, with names joined", () => {
    const r = queryBookings(index, { page: 2 });
    expect(r.items).toHaveLength(25);
    for (let i = 1; i < r.items.length; i++) expect(r.items[i - 1].date + r.items[i - 1].time >= r.items[i].date + r.items[i].time).toBe(true);
    expect(r.items[0].customerName).not.toBe("Unknown");
  });

  it("caps page size at 100", () => {
    expect(queryBookings(index, { pageSize: 5000 }).items).toHaveLength(100);
  });

  it("returns an empty page instead of failing past the end", () => {
    const r = queryBookings(index, { q: "no such dog name" });
    expect(r.total).toBe(0);
    expect(r.items).toEqual([]);
    expect(r.pages).toBe(1);
  });

  it("inserted bookings show up in the right date range and take the slot", () => {
    const before = queryBookings(index, { from: "2026-12-14", to: "2026-12-14" }).total;
    index.insert({ id: "bt1", customerId: "c1000", service: "bath", price: 48, date: "2026-12-14", time: "09:00", staff: "Kit", status: "pending" });
    expect(queryBookings(index, { from: "2026-12-14", to: "2026-12-14" }).total).toBe(before + 1);
    expect(index.slotTaken("2026-12-14", "09:00", "Kit")).toBe(true);
  });
});
