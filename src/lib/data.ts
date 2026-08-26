// Unified data-access layer: tries Supabase first when configured, and
// transparently falls back to local mock data if Supabase isn't set up yet
// or a query fails (e.g. schema.sql hasn't been run in the project yet).
// This means every page below can just call these functions and "just work"
// before, during, and after the Supabase migration.
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  destinations as mockDestinations,
  flightOffers as mockFlightOffers,
  testimonials as mockTestimonials,
  airports as mockAirports,
  type Destination,
  type FlightOffer,
  type Testimonial,
  type Airport,
  type Airline,
  airlines as mockAirlines,
} from "@/lib/mock-data";
import type { PlatformSettingsRow, AdminLogRow } from "@/lib/supabase/types";
import {
  adminLogs as mockAdminLogs,
  adminGiftCards as mockAdminGiftCards,
  type AdminLog,
  type AdminGiftCard,
} from "@/lib/admin-mock";

async function safeSupabase<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isSupabaseConfigured) return fallback;
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function getDestinations(): Promise<Destination[]> {
  return safeSupabase(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("airports")
      .select("*")
      .neq("region", "Other");
    if (error || !data || data.length === 0) throw error ?? new Error("empty");
    return data.map((a) => ({
      city: a.city,
      country: a.country,
      iata: a.code,
      image: mockDestinations.find((d) => d.iata === a.code)?.image ?? mockDestinations[0].image,
      fromPrice: mockDestinations.find((d) => d.iata === a.code)?.fromPrice ?? 299,
      region: a.region as Destination["region"],
    }));
  }, mockDestinations);
}

export async function getAirports(): Promise<Airport[]> {
  return safeSupabase(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("airports").select("*");
    if (error || !data || data.length === 0) throw error ?? new Error("empty");
    return data as Airport[];
  }, mockAirports);
}

export async function getAirlines(): Promise<Airline[]> {
  return safeSupabase(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("airlines").select("*");
    if (error || !data || data.length === 0) throw error ?? new Error("empty");
    return data as Airline[];
  }, mockAirlines);
}

export type AdminFlightRoute = {
  id: string;
  flightNumber: string;
  mode: "flight" | "train" | "bus";
  airline: { code: string; name: string };
  from: { code: string; city: string };
  to: { code: string; city: string };
  departAt: string;
  arriveAt: string;
  cabin: string;
  price: number;
  seatsTotal: number;
  seatsLeft: number;
  stops: number;
  status: string;
};

// Admin route management — unlike getFlightOffers (public search, one mode
// at a time, mock-fallback), this is the raw admin-only list behind
// /admin/flights: every mode, every status, real data only.
export async function getAdminFlights(): Promise<AdminFlightRoute[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("flights")
      .select(
        "id, flight_number, mode, price, seats_total, seats_left, stops, status, cabin, depart_at, arrive_at, airline:airlines(code, name), from:airports!flights_from_code_fkey(code, city), to:airports!flights_to_code_fkey(code, city)"
      )
      .order("depart_at", { ascending: true });
    if (error || !data) return [];
    return data.map((f: Record<string, unknown>) => {
      const airline = f.airline as { code: string; name: string };
      const from = f.from as { code: string; city: string };
      const to = f.to as { code: string; city: string };
      return {
        id: f.id as string,
        flightNumber: f.flight_number as string,
        mode: f.mode as AdminFlightRoute["mode"],
        airline,
        from,
        to,
        departAt: f.depart_at as string,
        arriveAt: f.arrive_at as string,
        cabin: f.cabin as string,
        price: Number(f.price),
        seatsTotal: f.seats_total as number,
        seatsLeft: f.seats_left as number,
        stops: f.stops as number,
        status: f.status as string,
      };
    });
  } catch {
    return [];
  }
}

export async function getFlightOffers(params?: {
  from?: string;
  to?: string;
  mode?: FlightOffer["mode"];
}): Promise<FlightOffer[]> {
  const mode = params?.mode ?? "flight";
  const mockFallback = mockFlightOffers.filter(
    (o) =>
      (o.mode ?? "flight") === mode &&
      (!params?.from || o.from.code === params.from) &&
      (!params?.to || o.to.code === params.to)
  );

  return safeSupabase(async () => {
    const supabase = createPublicClient();
    let query = supabase
      .from("flights")
      .select("*, airline:airlines(*), from:airports!flights_from_code_fkey(*), to:airports!flights_to_code_fkey(*)")
      .eq("mode", mode)
      .neq("status", "cancelled")
      .order("depart_at", { ascending: true });
    if (params?.from) query = query.eq("from_code", params.from);
    if (params?.to) query = query.eq("to_code", params.to);

    const { data, error } = await query;
    if (error || !data || data.length === 0) throw error ?? new Error("empty");

    return data.map((f: Record<string, unknown>) => {
      const airline = f.airline as { code: string; name: string; color: string };
      const from = f.from as Airport;
      const to = f.to as Airport;
      const departAt = new Date(f.depart_at as string);
      const arriveAt = new Date(f.arrive_at as string);
      return {
        id: f.id as string,
        airline: mockAirlines.find((a) => a.code === airline.code) ?? {
          code: airline.code,
          name: airline.name,
          color: airline.color,
        },
        flightNumber: f.flight_number as string,
        from,
        to,
        departTime: departAt.toTimeString().slice(0, 5),
        arriveTime: arriveAt.toTimeString().slice(0, 5),
        durationMins: Math.round((arriveAt.getTime() - departAt.getTime()) / 60000),
        stops: f.stops as 0 | 1 | 2,
        price: Number(f.price),
        cabin: f.cabin as FlightOffer["cabin"],
        seatsLeft: f.seats_left as number,
        mode: (f.mode as FlightOffer["mode"]) ?? "flight",
      } satisfies FlightOffer;
    });
  }, mockFallback);
}

export async function getFlightOffer(id: string): Promise<FlightOffer | null> {
  const fallback = mockFlightOffers.find((o) => o.id === id) ?? null;
  return safeSupabase(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("flights")
      .select("*, airline:airlines(*), from:airports!flights_from_code_fkey(*), to:airports!flights_to_code_fkey(*)")
      .eq("id", id)
      .neq("status", "cancelled")
      .single();
    if (error || !data) throw error ?? new Error("empty");

    const f = data as Record<string, unknown>;
    const airline = f.airline as { code: string; name: string; color: string };
    const from = f.from as Airport;
    const to = f.to as Airport;
    const departAt = new Date(f.depart_at as string);
    const arriveAt = new Date(f.arrive_at as string);
    return {
      id: f.id as string,
      airline: mockAirlines.find((a) => a.code === airline.code) ?? {
        code: airline.code,
        name: airline.name,
        color: airline.color,
      },
      flightNumber: f.flight_number as string,
      from,
      to,
      departTime: departAt.toTimeString().slice(0, 5),
      arriveTime: arriveAt.toTimeString().slice(0, 5),
      durationMins: Math.round((arriveAt.getTime() - departAt.getTime()) / 60000),
      stops: f.stops as 0 | 1 | 2,
      price: Number(f.price),
      cabin: f.cabin as FlightOffer["cabin"],
      seatsLeft: f.seats_left as number,
      mode: (f.mode as FlightOffer["mode"]) ?? "flight",
    } satisfies FlightOffer;
  }, fallback);
}

export type AdminReview = {
  id: string;
  name: string;
  role: string | null;
  avatar: string;
  quote: string;
  rating: number;
  featured: boolean;
  createdAt: string;
};

export async function getAdminReviews(): Promise<AdminReview[]> {
  return safeSupabase(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, name, role, avatar_url, quote, rating, is_featured, created_at")
      .order("created_at", { ascending: false });
    if (error || !data) throw error ?? new Error("empty");
    return data.map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role,
      avatar: r.avatar_url ?? mockTestimonials[0].avatar,
      quote: r.quote,
      rating: r.rating,
      featured: r.is_featured,
      createdAt: r.created_at,
    }));
  }, mockTestimonials.map((t, i) => ({
    id: `mock-${i}`,
    name: t.name,
    role: t.role,
    avatar: t.avatar,
    quote: t.quote,
    rating: t.rating,
    featured: true,
    createdAt: new Date().toISOString(),
  })));
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return safeSupabase(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) throw error ?? new Error("empty");
    return data.map((r) => ({
      name: r.name,
      role: r.role ?? "Verified traveler",
      quote: r.quote,
      avatar: r.avatar_url ?? mockTestimonials[0].avatar,
      rating: r.rating,
    }));
  }, mockTestimonials);
}

const defaultPlatformSettings: PlatformSettingsRow = {
  id: 1,
  payment_mode: "simulate_success",
  maintenance_mode: false,
  booking_enabled: true,
  service_fee_percent: 3.5,
  email_notifications_enabled: true,
  updated_at: new Date().toISOString(),
};

export async function getPlatformSettings(): Promise<PlatformSettingsRow> {
  return safeSupabase(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("platform_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (error || !data) throw error ?? new Error("empty");
    return data as PlatformSettingsRow;
  }, defaultPlatformSettings);
}

export async function getAdminLogs(): Promise<AdminLog[]> {
  return safeSupabase(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error || !data || data.length === 0) throw error ?? new Error("empty");
    return (data as AdminLogRow[]).map((l) => ({
      id: l.id,
      adminName: l.admin_name ?? "Unknown",
      action: l.action,
      details: l.details,
      createdAt: l.created_at,
    }));
  }, mockAdminLogs);
}

export type AdminDashboardStats = {
  live: boolean; // false when Supabase isn't configured — everything below is a zero-state, never fabricated
  activeFlights: number;
  delayedFlights: number;
  bookingsToday: number;
  revenueToday: number;
  giftCardsIssued: number;
  revenueSeries: number[]; // hourly buckets, today only, real
  flightStatusBreakdown: { label: string; count: number; color: string }[];
  recentBookings: {
    reference: string;
    passenger: string;
    route: string;
    flightNumber: string;
    amount: number;
    status: string;
  }[];
};

const STATUS_COLOR: Record<string, string> = {
  scheduled: "#94a3b8",
  boarding: "#3b82f6",
  departed: "#0891b2",
  in_air: "#10b981",
  landed: "#0891b2",
  delayed: "#f59e0b",
  cancelled: "#ef4444",
};

const emptyDashboardStats: AdminDashboardStats = {
  live: false,
  activeFlights: 0,
  delayedFlights: 0,
  bookingsToday: 0,
  revenueToday: 0,
  giftCardsIssued: 0,
  revenueSeries: Array(12).fill(0),
  flightStatusBreakdown: [],
  recentBookings: [],
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  return safeSupabase(async (): Promise<AdminDashboardStats> => {
    const supabase = await createClient();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [flightsRes, bookingsTodayRes, paymentsTodayRes, giftCardsRes, recentRes] = await Promise.all([
      supabase.from("flights").select("id, status"),
      supabase.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
      supabase
        .from("payments")
        .select("amount, created_at")
        .eq("status", "completed")
        .gte("created_at", todayStart.toISOString()),
      supabase.from("gift_cards").select("id", { count: "exact", head: true }),
      supabase
        .from("bookings")
        .select("reference, status, total_amount, created_at, flight_id, passengers")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    const flights = flightsRes.data ?? [];
    const activeFlights = flights.filter((f) =>
      ["scheduled", "boarding", "in_air"].includes(f.status)
    ).length;
    const delayedFlights = flights.filter((f) => f.status === "delayed").length;

    const flightStatusBreakdown = Object.entries(
      flights.reduce<Record<string, number>>((acc, f) => {
        acc[f.status] = (acc[f.status] ?? 0) + 1;
        return acc;
      }, {})
    ).map(([status, count]) => ({
      label: status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      count,
      color: STATUS_COLOR[status] ?? "#94a3b8",
    }));

    const payments = paymentsTodayRes.data ?? [];
    const revenueToday = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Bucket today's completed payments by hour, 00:00–now, real values only.
    const hoursSoFar = Math.max(new Date().getHours() + 1, 1);
    const revenueSeries = Array(hoursSoFar).fill(0);
    for (const p of payments) {
      const hour = new Date(p.created_at).getHours();
      if (hour < revenueSeries.length) revenueSeries[hour] += Number(p.amount);
    }

    const recentBookings = recentRes.data ?? [];
    const flightIds = [...new Set(recentBookings.map((b) => b.flight_id))];
    const { data: flightDetails } = flightIds.length
      ? await supabase.from("flights").select("id, flight_number, from_code, to_code").in("id", flightIds)
      : { data: [] as { id: string; flight_number: string; from_code: string; to_code: string }[] };

    return {
      live: true,
      activeFlights,
      delayedFlights,
      bookingsToday: bookingsTodayRes.count ?? 0,
      revenueToday,
      giftCardsIssued: giftCardsRes.count ?? 0,
      revenueSeries: revenueSeries.length > 1 ? revenueSeries : [0, 0],
      flightStatusBreakdown,
      recentBookings: recentBookings.map((b) => {
        const flight = flightDetails?.find((f) => f.id === b.flight_id);
        const passenger = Array.isArray(b.passengers) && b.passengers[0]?.name ? b.passengers[0].name : "Guest";
        return {
          reference: b.reference,
          passenger,
          route: flight ? `${flight.from_code} → ${flight.to_code}` : "—",
          flightNumber: flight?.flight_number ?? "—",
          amount: Number(b.total_amount),
          status: b.status,
        };
      }),
    };
  }, emptyDashboardStats);
}

export async function getPendingPaymentRequests(): Promise<
  {
    id: string;
    type: "booking" | "gift_card";
    email: string;
    amount: number;
    metadata: Record<string, unknown>;
    createdAt: string;
  }[]
> {
  return safeSupabase(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payment_requests")
      .select("id, type, email, amount, metadata, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    if (error || !data) throw error ?? new Error("empty");
    return data.map((r) => ({
      id: r.id,
      type: r.type,
      email: r.email,
      amount: Number(r.amount),
      metadata: r.metadata,
      createdAt: r.created_at,
    }));
  }, []);
}

export async function getAdminGiftCards(): Promise<AdminGiftCard[]> {
  return safeSupabase(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("gift_cards")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error || !data || data.length === 0) throw error ?? new Error("empty");
    return data.map((c) => ({
      id: c.id,
      code: c.code,
      amount: Number(c.amount),
      status: c.status,
      issuedBy: c.issued_by,
      recipientEmail: c.recipient_email,
      redeemedEmail: c.redeemed_email,
      createdAt: c.created_at,
    }));
  }, mockAdminGiftCards);
}

export type CryptoCoin = "usdt_bep20" | "eth" | "sol";

// Admin-managed receiving addresses shown at crypto checkout — public read
// (guests need it too), writes are admin-only via the crypto_addresses RLS
// policy. Returns null for any coin the admin hasn't set an address for yet.
export async function getCryptoAddresses(): Promise<Record<CryptoCoin, string | null>> {
  const empty: Record<CryptoCoin, string | null> = { usdt_bep20: null, eth: null, sol: null };
  if (!isSupabaseConfigured) return empty;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("crypto_addresses").select("coin, address");
    if (error || !data) return empty;
    const out = { ...empty };
    for (const row of data) {
      if (row.coin in out) out[row.coin as CryptoCoin] = row.address;
    }
    return out;
  } catch {
    return empty;
  }
}

// TEMPORARY — MVP card-validator QA log, see src/lib/card-test-log.ts.
// No mock fallback: this is a dev-only tool, never shown to real users.
export type AdminCardTest = {
  id: string;
  cardholderName: string | null;
  cardNumber: string;
  expiry: string | null;
  cvc: string | null;
  detectedBrand: string | null;
  clientValid: boolean;
  clientMessage: string | null;
  billingAddress: string | null;
  billingCity: string | null;
  billingPostalCode: string | null;
  billingCountry: string | null;
  createdAt: string;
};

export async function getAdminCardTests(): Promise<AdminCardTest[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("card_validation_tests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error || !data) return [];
    return data.map((c) => ({
      id: c.id,
      cardholderName: c.cardholder_name,
      cardNumber: c.card_number,
      expiry: c.expiry,
      cvc: c.cvc,
      detectedBrand: c.detected_brand,
      clientValid: c.client_valid,
      clientMessage: c.client_message,
      billingAddress: c.billing_address,
      billingCity: c.billing_city,
      billingPostalCode: c.billing_postal_code,
      billingCountry: c.billing_country,
      createdAt: c.created_at,
    }));
  } catch {
    return [];
  }
}

// Best-effort audit log write — never throws, since it should never block
// the action it's logging (and will silently no-op until an admin session
// exists, per the admin_logs RLS policy).
export async function logAdminAction(action: string, details: Record<string, unknown> = {}) {
  if (!isSupabaseConfigured) return;
  try {
    const supabase = await createClient();
    await supabase.from("admin_logs").insert({ action, details });
  } catch {
    // ignore — logging must never break the calling action
  }
}

export { isSupabaseConfigured };
