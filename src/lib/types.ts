export type Booking = { id: string; customerId: string; service: string; price: number; date: string; time: string; staff: string; status: string; notes?: string };
export type Customer = { id: string; name: string; email: string; phone: string; dog: string };
export type Service = { id: string; name: string; minutes: number; price: number };
export type BookingRow = Booking & { customerName: string; dog: string; serviceName: string };
