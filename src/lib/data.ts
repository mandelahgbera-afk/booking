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

export async function getFlightOffers(params?: {
  from?: string;
  to?: string;
}): Promise<FlightOffer[]> {
  const mockFallback = mockFlightOffers.filter(
    (o) =>
      (!params?.from || o.from.code === params.from) &&
      (!params?.to || o.to.code === params.to)
  );

  return safeSupabase(async () => {
    const supabase = createPublicClient();
    let query = supabase
      .from("flights")
      .select("*, airline:airlines(*), from:airports!flights_from_code_fkey(*), to:airports!flights_to_code_fkey(*)")
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
    } satisfies FlightOffer;
  }, fallback);
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
