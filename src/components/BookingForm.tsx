"use client";
import { useState } from "react";
import services from "@/data/services.json";
import { sendConfirmation } from "@/lib/mailer";

export default function BookingForm({ preselect }: { preselect: string }) {
  const [service, setService] = useState(preselect);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dog, setDog] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/bookings", { method: "POST", body: JSON.stringify({ service, date, time, name, email, dog }) });
    const data = await res.json();
    await sendConfirmation(email, `Booked ${service} on ${date} at ${time}`);
    setDone(data.ok);
  }

  if (done) return <div className="p-6 bg-green-100 rounded-xl">You&apos;re booked! 🎉</div>;
  return (
    <form onSubmit={submit} className="w-[520px] bg-white rounded-xl shadow p-6 space-y-3">
      <h2 className="text-xl font-semibold">Book an appointment</h2>
      <select value={service} onChange={(e) => setService(e.target.value)} className="w-full border rounded p-2">
        {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <div className="flex gap-3">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-[250px] border rounded p-2" />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-[250px] border rounded p-2" />
      </div>
      <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded p-2" />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded p-2" />
      <input placeholder="Dog's name and breed" value={dog} onChange={(e) => setDog(e.target.value)} className="w-full border rounded p-2" />
      <button className="w-full bg-blue-600 text-white rounded p-2">Book now</button>
    </form>
  );
}
