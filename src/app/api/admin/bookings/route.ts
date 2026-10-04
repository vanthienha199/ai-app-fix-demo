import { findBookings } from "@/lib/db";

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const result = findBookings({ q: p.get("q") ?? undefined, status: p.get("status") ?? undefined, from: p.get("from") ?? undefined, to: p.get("to") ?? undefined, page: Number(p.get("page") ?? 1), pageSize: Number(p.get("pageSize") ?? 25) });
  return Response.json(result);
}
