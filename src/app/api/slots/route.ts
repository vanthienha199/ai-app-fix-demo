import { availableSlots } from "@/lib/db";

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  return Response.json({ date, slots: availableSlots(date) });
}
