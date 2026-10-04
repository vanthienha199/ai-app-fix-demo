"use client";
import { useEffect, useState } from "react";
import type { Service } from "@/lib/types";

type Errors = Record<string, string>;
type Done = { id: string; date: string; time: string; staff: string; service: string; price: number };

function today() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export default function BookingForm({ services, preselect }: { services: Service[]; preselect: string }) {
  const [form, setForm] = useState({ service: preselect, date: "", time: "", name: "", email: "", phone: "", dog: "" });
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotState, setSlotState] = useState<"idle" | "loading" | "error">("idle");
  const [retry, setRetry] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [fatal, setFatal] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (!form.date) return;
    let live = true;
    setSlotState("loading");
    fetch(`/api/slots?date=${form.date}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d) => { if (live) { setSlots(d.slots); setSlotState("idle"); setForm((f) => (d.slots.includes(f.time) ? f : { ...f, time: "" })); } })
      .catch(() => live && setSlotState("error"));
    return () => { live = false; };
  }, [form.date, retry]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true); setErrors({}); setFatal("");
    try {
      const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201) setDone(data);
      else if (data.errors) setErrors(data.errors);
      else setFatal("Something went wrong on our side. Please try again in a minute.");
    } catch {
      setFatal("We could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  const err = (k: string) => errors[k] && <p className="mt-1 text-sm text-bad">{errors[k]}</p>;
  const label = "block text-sm font-medium mb-1.5";

  if (done) {
    return (
      <div className="card p-6 sm:p-8" role="status">
        <div className="grid place-items-center size-12 rounded-full bg-ok-soft text-ok text-xl">✓</div>
        <h2 className="mt-4 font-display font-bold text-2xl tracking-tight">You&apos;re booked</h2>
        <p className="mt-1 text-muted">A confirmation is on its way to {form.email}.</p>
        <dl className="mt-6 grid grid-cols-[110px_1fr] gap-y-2 text-[15px]">
          <dt className="text-muted">Service</dt><dd>{done.service}</dd>
          <dt className="text-muted">When</dt><dd className="num">{done.date} at {done.time}</dd>
          <dt className="text-muted">Groomer</dt><dd>{done.staff}</dd>
          <dt className="text-muted">Price</dt><dd className="num">${done.price}</dd>
        </dl>
        <button className="btn btn-ghost mt-6" onClick={() => { setDone(null); setForm((f) => ({ ...f, time: "" })); }}>Book another</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="card p-6 sm:p-8 space-y-5">
      <h2 className="font-display font-bold text-2xl tracking-tight">Book an appointment</h2>
      <div>
        <label className={label} htmlFor="service">Service</label>
        <select id="service" className="field" value={form.service} onChange={set("service")} aria-invalid={!!errors.service}>
          {services.map((s) => <option key={s.id} value={s.id}>{s.name} · ${s.price}</option>)}
        </select>
        {err("service")}
      </div>
      <div>
        <label className={label} htmlFor="date">Date</label>
        <input id="date" type="date" min={today()} className="field" value={form.date} onChange={set("date")} aria-invalid={!!errors.date} />
        {err("date")}
      </div>
      <div>
        <span className={label}>Time</span>
        {!form.date && <p className="text-sm text-muted">Pick a date to see open times.</p>}
        {form.date && slotState === "loading" && <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">{Array.from({ length: 12 }, (_, i) => <div key={i} className="skeleton h-9" />)}</div>}
        {form.date && slotState === "error" && <p className="text-sm text-bad">Could not load times. <button type="button" className="underline" onClick={() => setRetry((n) => n + 1)}>Retry</button></p>}
        {form.date && slotState === "idle" && slots && slots.length === 0 && <p className="text-sm text-muted">That day is fully booked. Try the next day.</p>}
        {form.date && slotState === "idle" && slots && slots.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2" role="radiogroup" aria-label="Time">
            {slots.map((t) => (
              <button type="button" key={t} role="radio" aria-checked={form.time === t} onClick={() => setForm((f) => ({ ...f, time: t }))}
                className={`num text-sm rounded-[10px] border py-2 transition-colors ${form.time === t ? "bg-accent text-accent-ink border-accent" : "border-line hover:border-accent"}`}>{t}</button>
            ))}
          </div>
        )}
        {err("time")}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className={label} htmlFor="name">Your name</label><input id="name" className="field" value={form.name} onChange={set("name")} aria-invalid={!!errors.name} autoComplete="name" />{err("name")}</div>
        <div><label className={label} htmlFor="dog">Dog&apos;s name and breed</label><input id="dog" className="field" value={form.dog} onChange={set("dog")} aria-invalid={!!errors.dog} />{err("dog")}</div>
        <div><label className={label} htmlFor="email">Email</label><input id="email" type="email" className="field" value={form.email} onChange={set("email")} aria-invalid={!!errors.email} autoComplete="email" />{err("email")}</div>
        <div><label className={label} htmlFor="phone">Phone <span className="text-faint font-normal">(optional)</span></label><input id="phone" type="tel" className="field" value={form.phone} onChange={set("phone")} aria-invalid={!!errors.phone} autoComplete="tel" />{err("phone")}</div>
      </div>
      {fatal && <p className="rounded-[10px] bg-bad-soft text-bad px-3 py-2 text-sm" role="alert">{fatal}</p>}
      <button className="btn w-full" disabled={pending}>{pending ? "Booking..." : "Book now"}</button>
    </form>
  );
}
