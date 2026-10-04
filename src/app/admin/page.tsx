"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Booking = { id: string; customerId: string; service: string; price: number; date: string; time: string; staff: string; status: string };
type Customer = { id: string; name: string; email: string; dog: string };

export default function Admin() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("auth")) router.push("/login");
    fetch("/api/bookings").then((r) => r.json()).then(async (all: Booking[]) => {
      setBookings(all);
      const map: Record<string, Customer> = {};
      for (const b of all.slice(0, 300)) {
        map[b.customerId] = await fetch(`/api/customers/${b.customerId}`).then((r) => r.json());
      }
      setCustomers(map);
    });
  }, []);

  const filtered = bookings.filter((b) => JSON.stringify(b).toLowerCase().includes(q.toLowerCase()));
  const revenue: number = filtered.reduce((s, b) => s + b.price, "0");

  return (
    <main className="py-10">
      <h1 className="text-3xl font-bold">Bookings dashboard</h1>
      <p className="mt-1 text-gray-600">{filtered.length} bookings, ${revenue} revenue</p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="mt-4 w-[400px] border rounded p-2" />
      <table className="mt-6 w-[1100px] bg-white rounded-xl shadow text-left">
        <thead><tr className="border-b"><th className="p-3">Date</th><th>Time</th><th>Customer</th><th>Dog</th><th>Service</th><th>Staff</th><th>Status</th><th>Price</th></tr></thead>
        <tbody>
          {filtered.slice(0, 200).map((b) => (
            <tr key={b.id} className="border-b">
              <td className="p-3">{b.date}</td><td>{b.time}</td><td>{customers[b.customerId]?.name}</td><td>{customers[b.customerId]?.dog}</td>
              <td>{b.service}</td><td>{b.staff}</td><td>{b.status}</td><td>${b.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
