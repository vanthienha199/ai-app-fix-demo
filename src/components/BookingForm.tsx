"use client";
import { useEffect, useState } from "react";
import type { Service } from "@/lib/types";

type Errors = Record<string, string>;
type Done = { id: string; date: string; time: string; staff: string; service: string; price: number };
const DOGS = [
  { id: "biscuit", name: "Biscuit", breed: "Labrador", pos: "40% 30%" },
  { id: "juniper", name: "Juniper", breed: "Corgi", pos: "50% 35%" },
  { id: "mochi", name: "Mochi", breed: "Shih Tzu", pos: "50% 45%" },
  { id: "maple", name: "Maple", breed: "Golden Retriever", pos: "50% 30%" },
];

function today() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function niceDay(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });
}
function Paw() {
  return <svg className="paw inline-block" width="16" height="16" viewBox="0 0 32 32" aria-hidden="true"><g fill="currentColor"><ellipse cx="16" cy="21" rx="7" ry="6" /><circle cx="7.5" cy="13" r="3.2" /><circle cx="13" cy="8" r="3.2" /><circle cx="19" cy="8" r="3.2" /><circle cx="24.5" cy="13" r="3.2" /></g></svg>;
}
function Step({ n, title, children, done }: { n: number; title: string; children: React.ReactNode; done: boolean }) {
  return (
    <section className="card p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-5">
        <span className={`grid place-items-center size-9 rounded-full font-display font-extrabold text-lg ${done ? "bg-accent text-accent-ink" : "bg-surface-2 text-muted"}`}>{n}</span>
        <h2 className="text-2xl sm:text-3xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function BookingForm({ services, preselect }: { services: Service[]; preselect: string }) {
  const [form, setForm] = useState({ service: preselect, date: "", time: "", name: "", email: "", phone: "", dog: "" });
  const [dogPick, setDogPick] = useState("");
  const [breed, setBreed] = useState("");
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

  function pickDog(d: (typeof DOGS)[number]) {
    setDogPick(d.id);
    setBreed(d.breed);
    setForm((f) => ({ ...f, dog: `${d.name}, ${d.breed}` }));
  }

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
      setFatal("We could not reach the shop. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  const err = (k: string) => errors[k] && <p className="mt-1.5 text-sm font-semibold text-bad">{errors[k]}</p>;
  const label = "block text-[15px] font-bold mb-1.5";
  const dogName = form.dog.split(",")[0].trim();
  const photo = DOGS.find((d) => d.id === dogPick);

  if (done) {
    return (
      <div className="card overflow-hidden grid sm:grid-cols-[1fr_1.1fr]" role="status">
        <div className="aspect-[4/3] sm:aspect-auto bg-surface-2">{photo && <img src={`/dogs/${photo.id}.jpg`} alt={photo.name} className="w-full h-full object-cover" style={{ objectPosition: photo.pos }} />}</div>
        <div className="p-7 sm:p-10">
          <h2 className="text-4xl sm:text-5xl leading-tight">See you {niceDay(done.date)}, {dogName || "friend"}.</h2>
          <p className="mt-3 text-muted text-lg">{done.service} with {done.staff}, {done.time} on {done.date}. A confirmation is on its way to {form.email}.</p>
          <p className="mt-5 text-2xl font-bold">${done.price}</p>
          <button className="btn btn-ghost mt-7" onClick={() => { setDone(null); setForm((f) => ({ ...f, time: "" })); }}>Book another visit</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <Step n={1} title="Your dog" done={!!form.dog}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DOGS.map((d) => (
            <button type="button" key={d.id} onClick={() => pickDog(d)} aria-pressed={dogPick === d.id}
              className={`text-left rounded-2xl overflow-hidden border-2 transition-colors ${dogPick === d.id ? "border-accent" : "border-transparent hover:border-line"}`}>
              <img src={`/dogs/${d.id}.jpg`} alt="" className="w-full aspect-[4/3.4] object-cover rounded-xl" style={{ objectPosition: d.pos }} />
              <span className="block px-1.5 pt-2 font-bold">{d.name}</span>
              <span className="block px-1.5 pb-1.5 text-sm text-muted">{d.breed}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">Returning dogs from the sample book are above. A new dog?</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <div><label className={label} htmlFor="dogname">Name</label><input id="dogname" className="field" value={dogName} onChange={(e) => { setDogPick(""); setForm((f) => ({ ...f, dog: e.target.value + (breed ? `, ${breed}` : "") })); }} aria-invalid={!!errors.dog} /></div>
          <div><label className={label} htmlFor="breed">Breed</label><input id="breed" className="field" value={breed} onChange={(e) => { setDogPick(""); setBreed(e.target.value); setForm((f) => ({ ...f, dog: `${dogName}${e.target.value ? ", " + e.target.value : ""}` })); }} /></div>
        </div>
        {err("dog")}
      </Step>

      <Step n={2} title="What they need" done={!!form.service}>
        <div className="grid gap-2.5" role="radiogroup" aria-label="Service">
          {services.map((s) => (
            <label key={s.id} className={`flex items-center justify-between gap-4 rounded-2xl border-2 px-5 py-4 cursor-pointer transition-colors ${form.service === s.id ? "border-accent bg-accent-soft" : "border-line hover:border-faint"}`}>
              <span className="flex items-center gap-3"><input type="radio" name="service" value={s.id} checked={form.service === s.id} onChange={set("service")} className="accent-[#4F7A3A] size-4" /><span><span className="block font-bold">{s.name}</span><span className="text-sm text-muted">About {s.minutes} minutes</span></span></span>
              <span className="font-bold text-lg">${s.price}</span>
            </label>
          ))}
        </div>
        {err("service")}
      </Step>

      <Step n={3} title="When" done={!!form.time}>
        <div className="grid gap-4 sm:grid-cols-[220px_1fr] items-start">
          <div><label className={label} htmlFor="date">Day</label><input id="date" type="date" min={today()} className="field" value={form.date} onChange={set("date")} aria-invalid={!!errors.date} />{err("date")}</div>
          <div>
            <span className={label}>Time</span>
            {!form.date && <p className="text-muted py-2.5">Pick a day to see open times.</p>}
            {form.date && slotState === "loading" && <div className="grid grid-cols-4 gap-2">{Array.from({ length: 12 }, (_, i) => <div key={i} className="skeleton h-11" />)}</div>}
            {form.date && slotState === "error" && <p className="text-bad font-semibold py-2.5">Could not load times. <button type="button" className="underline" onClick={() => setRetry((n) => n + 1)}>Try again</button></p>}
            {form.date && slotState === "idle" && slots && slots.length === 0 && <p className="text-muted py-2.5">That day is fully booked. The next day usually has room.</p>}
            {form.date && slotState === "idle" && slots && slots.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2" role="radiogroup" aria-label="Time">
                {slots.map((t) => (
                  <button type="button" key={t} role="radio" aria-checked={form.time === t} onClick={() => setForm((f) => ({ ...f, time: t }))}
                    className={`h-11 rounded-xl border-2 text-[15px] font-bold flex items-center justify-center gap-1.5 transition-colors ${form.time === t ? "bg-accent text-accent-ink border-accent" : "border-line hover:border-accent"}`}>
                    {form.time === t && <Paw key={t} />}{t}
                  </button>
                ))}
              </div>
            )}
            {err("time")}
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div><label className={label} htmlFor="name">Your name</label><input id="name" className="field" value={form.name} onChange={set("name")} aria-invalid={!!errors.name} autoComplete="name" />{err("name")}</div>
          <div><label className={label} htmlFor="email">Email</label><input id="email" type="email" className="field" value={form.email} onChange={set("email")} aria-invalid={!!errors.email} autoComplete="email" />{err("email")}</div>
          <div><label className={label} htmlFor="phone">Phone <span className="text-faint font-semibold">(optional)</span></label><input id="phone" type="tel" className="field" value={form.phone} onChange={set("phone")} aria-invalid={!!errors.phone} autoComplete="tel" />{err("phone")}</div>
        </div>
      </Step>

      {fatal && <p className="rounded-2xl bg-bad-soft text-bad font-semibold px-5 py-3" role="alert">{fatal}</p>}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-muted">{form.time && dogName ? `${dogName}, ${form.time} on ${form.date}` : "Nothing is charged until the visit."}</p>
        <button className="btn text-lg" disabled={pending}>{pending ? "Booking..." : "Book the visit"}</button>
      </div>
    </form>
  );
}
