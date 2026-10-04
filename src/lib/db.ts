import "server-only";
import bookingsJson from "@/data/bookings.json";
import customersJson from "@/data/customers.json";
import servicesJson from "@/data/services.json";
import type { Booking, BookingRow, Customer, Service } from "./types";
import { buildIndex, queryBookings, type Query } from "./query";

const customers = customersJson as Customer[];
const services = servicesJson as Service[];
const index = buildIndex(bookingsJson as Booking[], customers, services);

export function listServices() {
  return services;
}

export function findBookings(q: Query) {
  return queryBookings(index, q);
}

export function addBooking(b: Omit<Booking, "id" | "status" | "price" | "staff" | "customerId">, customer: Omit<Customer, "id">): BookingRow {
  const svc = index.services.get(b.service);
  if (!svc) throw new Error("Unknown service");
  const c: Customer = { id: "c" + (900000 + index.customers.size), ...customer };
  index.customers.set(c.id, c);
  const staff = ["Rosa", "Dev", "Kit", "Amara"].find((s) => !index.slotTaken(b.date, b.time, s)) || "Rosa";
  const booking: Booking = { ...b, id: "b" + Date.now().toString(36), customerId: c.id, price: svc.price, staff, status: "pending" };
  return index.insert(booking);
}

export function availableSlots(date: string) {
  return index.availableSlots(date);
}
