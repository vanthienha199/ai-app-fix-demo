"use client";
import { useSearchParams } from "next/navigation";
import BookingForm from "@/components/BookingForm";
import services from "@/data/services.json";

export default function Home() {
  const params = useSearchParams();
  const preselect = params.get("service") || "full";
  return (
    <main className="py-10">
      <h1 className="text-4xl font-bold text-blue-600">Mossy Paws Grooming 🐶</h1>
      <p className="mt-2 text-gray-600">Book your pup&apos;s next spa day in seconds!</p>
      <div className="grid grid-cols-2 gap-8 mt-8">
        <div className="w-[520px]">
          <h2 className="text-xl font-semibold mb-4">Our services</h2>
          {services.map((s) => (
            <div key={s.id} className="flex justify-between border-b py-3">
              <span>{s.name}</span>
              <span>${s.price}</span>
            </div>
          ))}
        </div>
        <BookingForm preselect={preselect} />
      </div>
    </main>
  );
}
