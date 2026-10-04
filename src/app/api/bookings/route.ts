import { addBooking, availableSlots, listServices } from "@/lib/db";
import { sendConfirmation } from "@/lib/mailer";
import { validateBooking } from "@/lib/validate";

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Send JSON" }, { status: 400 }); }
  const today = new Date().toISOString().slice(0, 10);
  const check = validateBooking(body, listServices().map((s) => s.id), today);
  if (!check.ok) return Response.json({ errors: check.errors }, { status: 422 });
  const v = check.value;
  if (!availableSlots(v.date).includes(v.time)) return Response.json({ errors: { time: "That slot was just taken, pick another" } }, { status: 409 });
  const row = addBooking({ service: v.service, date: v.date, time: v.time, notes: "" }, { name: v.name, email: v.email, phone: v.phone, dog: v.dog });
  await sendConfirmation({ to: v.email, subject: "Your Mossy Paws booking", text: `${row.serviceName} for ${v.dog} on ${v.date} at ${v.time} with ${row.staff}.` });
  return Response.json({ id: row.id, date: row.date, time: row.time, staff: row.staff, service: row.serviceName, price: row.price }, { status: 201 });
}
