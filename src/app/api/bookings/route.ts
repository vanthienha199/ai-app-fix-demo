import bookings from "@/data/bookings.json";

const created: unknown[] = [];

export async function GET() {
  return Response.json([...created, ...bookings]);
}

export async function POST(req: Request) {
  const body = await req.json();
  created.unshift({ id: "b" + Date.now(), ...body, status: "pending" });
  return Response.json({ ok: true });
}
