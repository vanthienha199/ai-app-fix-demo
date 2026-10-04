import { describe, expect, it } from "vitest";
import { validateBooking } from "@/lib/validate";

const ids = ["bath", "full"];
const good = { service: "full", date: "2026-11-02", time: "10:15", name: "Maya Chen", email: "maya@example.com", phone: "(555) 201-3344", dog: "Biscuit, Cockapoo" };

describe("validateBooking", () => {
  it("accepts a complete booking", () => {
    expect(validateBooking(good, ids, "2026-10-04").ok).toBe(true);
  });
  it("reports every bad field at once", () => {
    const r = validateBooking({ ...good, service: "x", date: "2026-01-01", time: "07:10", email: "nope", dog: "" }, ids, "2026-10-04");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["date", "dog", "email", "service", "time"]);
  });
  it("treats a missing body as all fields missing", () => {
    expect(validateBooking(null, ids, "2026-10-04").ok).toBe(false);
  });
});
