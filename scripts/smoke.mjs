import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const PASSWORD = process.env.STAFF_PASSWORD;
const results = [];
const check = (name, ok, extra = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${name}${extra ? "  (" + extra + ")" : ""}`); };

let r = await fetch(BASE + "/admin", { redirect: "manual" });
check("signed-out visit to /admin redirects to sign in", r.status === 307 && r.headers.get("location").includes("/login"));
r = await fetch(BASE + "/api/admin/bookings");
check("bookings API refuses signed-out callers", r.status === 401);
r = await fetch(BASE + "/api/bookings");
check("old open bookings list is gone", r.status === 405);

const form = (pw) => new URLSearchParams({ password: pw, next: "/admin" });
r = await fetch(BASE + "/api/login", { method: "POST", body: form("pawsadmin2024"), redirect: "manual" });
check("old hardcoded password no longer works", r.status === 303 && r.headers.get("location").includes("error=1"));
if (PASSWORD) {
  r = await fetch(BASE + "/api/login", { method: "POST", body: form(PASSWORD), redirect: "manual" });
  const cookie = (r.headers.get("set-cookie") || "").split(";")[0];
  check("staff sign in lands on /admin with an httpOnly cookie", r.status === 303 && r.headers.get("location").endsWith("/admin") && /httponly/i.test(r.headers.get("set-cookie") || ""));
  const t0 = performance.now();
  r = await fetch(BASE + "/admin", { headers: { cookie } });
  const html = await r.text();
  check("signed-in /admin renders the bookings page", r.status === 200 && html.includes("bookings match"), `${Math.round(performance.now() - t0)} ms, ${(html.length / 1024).toFixed(1)} KB html`);
  r = await fetch(BASE + "/api/admin/bookings?status=confirmed&pageSize=25", { headers: { cookie } });
  const j = await r.json();
  check("API returns one filtered page", r.ok && j.items.length === 25 && j.items.every((b) => b.status === "confirmed"), `${JSON.stringify(j).length} bytes`);
}

const day = new Date(Date.now() + 9 * 86400000).toISOString().slice(0, 10);
r = await fetch(`${BASE}/api/slots?date=${day}`);
const { slots } = await r.json();
check("slots endpoint lists open times", r.ok && slots.length > 0);
r = await fetch(BASE + "/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ service: "full" }) });
check("bad booking returns field errors", r.status === 422 && Object.keys((await r.json()).errors).length >= 4);
r = await fetch(BASE + "/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ service: "full", date: day, time: slots[0], name: "Smoke Test", email: "smoke@example.com", phone: "", dog: "Pickle, Corgi" }) });
check("valid booking is created", r.status === 201);

const dir = process.env.NEXT_DIR || ".next/static";
const secrets = ["mailpost_live_", process.env.SESSION_SECRET, PASSWORD, "pawsadmin2024"].filter(Boolean);
let leaks = [];
if (fs.existsSync(dir)) {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  for (const f of walk(dir).filter((f) => f.endsWith(".js"))) { const t = fs.readFileSync(f, "utf8"); for (const s of secrets) if (t.includes(s)) leaks.push(path.basename(f)); }
  check("no secret strings in the client bundle", leaks.length === 0, `${walk(dir).length} files scanned`);
}
const failed = results.filter((x) => !x).length;
console.log(`${results.length - failed}/${results.length} smoke checks passed`);
process.exit(failed ? 1 : 0);
