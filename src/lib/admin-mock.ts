// Mock data that powers the admin dashboard until real bookings/payments
// tables have traffic. Shapes mirror the `bookings` / `payments` tables.

export const adminStats = {
  activeFlights: { value: 428, delta: "+12 today" },
  bookingsToday: { value: 1284, delta: "+10.4% vs yesterday" },
  passengersCheckedIn: { value: 9762, delta: "82% completion" },
  revenueToday: { value: 48692, delta: "+9.8% vs last Tuesday" },
  delayedFlights: { value: 17, delta: "Needs attention" },
};

export const revenueSeries = [
  12200, 14800, 13950, 18200, 21400, 26800, 31200, 29400, 33800, 38200, 41200,
  39800, 43600, 48692,
];

export const flightStatusBreakdown = [
  { label: "Scheduled", count: 215, color: "#94a3b8" },
  { label: "Boarding", count: 42, color: "#3b82f6" },
  { label: "In air", count: 61, color: "#10b981" },
  { label: "Landed", count: 96, color: "#0891b2" },
  { label: "Delayed", count: 17, color: "#f59e0b" },
  { label: "Cancelled", count: 4, color: "#ef4444" },
];

export type AdminBooking = {
  reference: string;
  passenger: string;
  route: string;
  flightNumber: string;
  amount: number;
  status: "confirmed" | "pending" | "cancelled" | "refunded";
  date: string;
};

export const recentBookings: AdminBooking[] = [
  { reference: "8F3K2A", passenger: "Sarah Ahmed", route: "JFK → LHR", flightNumber: "BA 118", amount: 403, status: "confirmed", date: "2026-08-21" },
  { reference: "9K2L1P", passenger: "James Whitfield", route: "LAX → HND", flightNumber: "NA 905", amount: 741, status: "confirmed", date: "2026-08-21" },
  { reference: "3M9Q7R", passenger: "Aiko Tanaka", route: "SFO → SIN", flightNumber: "TP 221", amount: 812, status: "pending", date: "2026-08-20" },
  { reference: "5T1V8W", passenger: "Daniel Okoro", route: "ORD → DXB", flightNumber: "EJ 340", amount: 655, status: "confirmed", date: "2026-08-20" },
  { reference: "2B6N4X", passenger: "Priya Nair", route: "JFK → LHR", flightNumber: "AF 712", amount: 412, status: "refunded", date: "2026-08-19" },
  { reference: "7C5H3Y", passenger: "Tom Baxter", route: "LAX → HND", flightNumber: "NA 905", amount: 741, status: "cancelled", date: "2026-08-19" },
];

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  bookings: number;
  joined: string;
};

export const adminUsers: AdminUser[] = [
  { id: "u1", name: "Sarah Ahmed", email: "sarah.ahmed@example.com", role: "user", bookings: 4, joined: "2025-11-02" },
  { id: "u2", name: "James Whitfield", email: "james.w@example.com", role: "user", bookings: 2, joined: "2025-12-18" },
  { id: "u3", name: "Aiko Tanaka", email: "aiko.tanaka@example.com", role: "user", bookings: 7, joined: "2025-09-30" },
  { id: "u4", name: "Daniel Okoro", email: "daniel.okoro@example.com", role: "user", bookings: 1, joined: "2026-01-14" },
  { id: "u5", name: "Zara Khan", email: "zara.khan@example.com", role: "admin", bookings: 0, joined: "2025-06-01" },
];

export type AdminGiftCard = {
  id: string;
  code: string;
  amount: number;
  status: "active" | "redeemed" | "void";
  issuedBy: string;
  recipientEmail: string | null;
  redeemedEmail: string | null;
  createdAt: string;
};

export const adminGiftCards: AdminGiftCard[] = [
  { id: "g1", code: "AIRFLY-DEMO-0100", amount: 100, status: "active", issuedBy: "admin:seed", recipientEmail: "demo@airfly.test", redeemedEmail: null, createdAt: "2026-08-15" },
  { id: "g2", code: "AIRFLY-DEMO-0250", amount: 250, status: "active", issuedBy: "admin:seed", recipientEmail: null, redeemedEmail: null, createdAt: "2026-08-15" },
  { id: "g3", code: "AIRFLY-DEMO-0500", amount: 500, status: "void", issuedBy: "admin:seed", recipientEmail: null, redeemedEmail: null, createdAt: "2026-08-15" },
  { id: "g4", code: "AIRFLY-7K2M-9QRT", amount: 150, status: "redeemed", issuedBy: "purchase", recipientEmail: "friend@example.com", redeemedEmail: "friend@example.com", createdAt: "2026-08-19" },
];

export type AdminLog = {
  id: string;
  adminName: string;
  action: string;
  details: Record<string, unknown>;
  createdAt: string;
};

export const adminLogs: AdminLog[] = [
  { id: "l1", adminName: "System", action: "platform_settings.update", details: { payment_mode: "simulate_success" }, createdAt: "2026-08-21T09:12:00Z" },
  { id: "l2", adminName: "System", action: "flights.seed", details: { count: 5 }, createdAt: "2026-08-20T22:04:00Z" },
  { id: "l3", adminName: "System", action: "reviews.seed", details: { count: 4 }, createdAt: "2026-08-20T22:04:00Z" },
];

export type AdminPayment = {
  id: string;
  reference: string;
  method: "card" | "apple_pay" | "google_pay" | "paypal" | "split";
  amount: number;
  status: "completed" | "pending" | "failed";
  date: string;
};

export const adminPayments: AdminPayment[] = [
  { id: "p1", reference: "8F3K2A", method: "card", amount: 403, status: "completed", date: "2026-08-21" },
  { id: "p2", reference: "9K2L1P", method: "apple_pay", amount: 741, status: "completed", date: "2026-08-21" },
  { id: "p3", reference: "3M9Q7R", method: "split", amount: 812, status: "pending", date: "2026-08-20" },
  { id: "p4", reference: "5T1V8W", method: "google_pay", amount: 655, status: "completed", date: "2026-08-20" },
  { id: "p5", reference: "2B6N4X", method: "card", amount: 412, status: "failed", date: "2026-08-19" },
];
