import { SLOT_TIMES } from "./query";

export type BookingInput = { service: string; date: string; time: string; name: string; email: string; phone: string; dog: string };

export function validateBooking(raw: unknown, serviceIds: string[], today: string): { ok: true; value: BookingInput } | { ok: false; errors: Record<string, string> } {
  const b = (raw ?? {}) as Record<string, unknown>;
  const s = (k: string) => (typeof b[k] === "string" ? (b[k] as string).trim() : "");
  const v: BookingInput = { service: s("service"), date: s("date"), time: s("time"), name: s("name"), email: s("email"), phone: s("phone"), dog: s("dog") };
  const errors: Record<string, string> = {};
  if (!serviceIds.includes(v.service)) errors.service = "Pick a service";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date)) errors.date = "Pick a date";
  else if (v.date < today) errors.date = "That date has passed";
  if (!SLOT_TIMES.includes(v.time)) errors.time = "Pick a time slot";
  if (v.name.length < 2 || v.name.length > 80) errors.name = "Enter your name";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email) || v.email.length > 120) errors.email = "Enter a valid email";
  if (v.phone && !/^[0-9()+\-.\s]{7,20}$/.test(v.phone)) errors.phone = "Enter a valid phone number";
  if (v.dog.length < 2 || v.dog.length > 80) errors.dog = "Tell us your dog's name";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: v };
}
