import fs from "node:fs";

let seed = 20261004;
const rnd = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (a) => a[Math.floor(rnd() * a.length)];
const FIRST = ["Maya", "Theo", "Ines", "Owen", "Priya", "Lena", "Marcus", "Hana", "Diego", "Ruth", "Kenji", "Sofia", "Wes", "Aisha", "Jonah", "Elif", "Noor", "Caleb", "Zara", "Felix", "Imani", "Luca", "Mei", "Arjun"];
const LAST = ["Chen", "Alvarez", "Okafor", "Brandt", "Raman", "Haddad", "Patel", "Kowalczyk", "Mori", "Marchetti", "Adebayo", "Lindqvist", "Whitfield", "Santos", "Vu", "Karimi", "Grant", "Delacroix", "Novak", "Osei"];
const DOGS = ["Biscuit", "Juniper", "Mochi", "Pepper", "Otis", "Maple", "Bruno", "Clover", "Ziggy", "Hazel", "Rufus", "Nori", "Pickle", "Willow", "Gus", "Tofu"];
const BREEDS = ["Golden Retriever", "Cockapoo", "Shih Tzu", "Border Collie", "Labrador", "Poodle (mini)", "Corgi", "Bernedoodle", "Schnauzer", "Mixed breed"];
export const SERVICES = [
  { id: "bath", name: "Bath and brush", minutes: 45, price: 48 },
  { id: "full", name: "Full groom", minutes: 90, price: 86 },
  { id: "puppy", name: "Puppy intro", minutes: 30, price: 35 },
  { id: "nails", name: "Nail trim", minutes: 15, price: 18 },
  { id: "deshed", name: "De-shed treatment", minutes: 60, price: 64 },
];
const STAFF = ["Rosa", "Dev", "Kit", "Amara"];
const customers = Array.from({ length: 6200 }, (_, i) => {
  const f = pick(FIRST), l = pick(LAST);
  return { id: `c${1000 + i}`, name: `${f} ${l}`, email: `${f}.${l}${i % 97}@example.com`.toLowerCase(), phone: `(555) ${String(100 + (i % 900)).padStart(3, "0")}-${String(1000 + ((i * 37) % 9000)).padStart(4, "0")}`, dog: `${pick(DOGS)}, ${pick(BREEDS)}` };
});
const start = new Date("2024-10-01T00:00:00Z").getTime();
const bookings = [];
for (let i = 0; i < 38400; i++) {
  const day = Math.floor(rnd() * 760);
  const d = new Date(start + day * 86400000);
  const s = pick(SERVICES);
  const hour = 8 + Math.floor(rnd() * 9);
  const min = pick([0, 15, 30, 45]);
  const date = d.toISOString().slice(0, 10);
  const status = day > 735 ? pick(["confirmed", "confirmed", "pending"]) : pick(["completed", "completed", "completed", "completed", "cancelled", "no_show"]);
  bookings.push({ id: `b${200000 + i}`, customerId: pick(customers).id, service: s.id, price: s.price + (s.id === "full" && rnd() < 0.3 ? 14 : 0), date, time: `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`, staff: pick(STAFF), status, notes: rnd() < 0.12 ? pick(["Nervous with dryers", "Matting behind ears", "Allergic to oatmeal shampoo", "Prefers Rosa"]) : "" });
}
bookings.sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
fs.writeFileSync("src/data/customers.json", JSON.stringify(customers));
fs.writeFileSync("src/data/bookings.json", JSON.stringify(bookings));
fs.writeFileSync("src/data/services.json", JSON.stringify(SERVICES, null, 2));
console.log(customers.length, "customers", bookings.length, "bookings");
