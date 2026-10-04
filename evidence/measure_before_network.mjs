const BASE = process.env.BASE_URL || "http://localhost:3311";
await fetch(BASE + "/api/bookings");
await fetch(BASE + "/api/customers/c1000");
const t0 = performance.now();
const res = await fetch(BASE + "/api/bookings");
const body = await res.text();
const all = JSON.parse(body);
const tList = performance.now() - t0;
let n = 0;
for (const b of all.slice(0, 300)) { await (await fetch(`${BASE}/api/customers/${b.customerId}`)).json(); n++; }
const tTotal = performance.now() - t0;
console.log(JSON.stringify({ bookingsPayloadBytes: body.length, bookingsRows: all.length, msForBookingsList: Math.round(tList), customerRequests: n, msUntilAllNamesFetched: Math.round(tTotal), openWithoutLogin: res.status }, null, 2));
