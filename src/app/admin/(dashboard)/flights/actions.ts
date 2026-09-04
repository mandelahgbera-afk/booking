"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { logAdminAction } from "@/lib/data";

export type NewLocation = {
  city: string;
  name: string;
  country: string;
  region: "North America" | "South America" | "Europe" | "Africa" | "Asia" | "Middle East" | "Oceania";
  lat: number;
  lng: number;
};

export type NewOperator = { name: string; color: string };

export type CreateRouteInput = {
  mode: "flight" | "train" | "bus";
  flightNumber: string;
  airlineCode: string;
  newAirline?: NewOperator;
  fromCode: string;
  newFrom?: NewLocation;
  toCode: string;
  newTo?: NewLocation;
  departAt: string;
  arriveAt: string;
  cabin: "Economy" | "Premium Economy" | "Business" | "First";
  price: number;
  seatsTotal: number;
  stops: 0 | 1 | 2;
};

function revalidateRoutePages() {
  revalidatePath("/admin/flights");
  revalidatePath("/flights");
  revalidatePath("/trains");
  revalidatePath("/buses");
}

export async function createRoute(input: CreateRouteInput): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Preview only — connect Supabase to persist changes." };
  }

  const airlineCode = input.airlineCode.trim().toUpperCase();
  const fromCode = input.fromCode.trim().toUpperCase();
  const toCode = input.toCode.trim().toUpperCase();
  const flightNumber = input.flightNumber.trim();

  if (!airlineCode || !fromCode || !toCode || !flightNumber) {
    return { ok: false, message: "Route number, operator, from, and to are all required." };
  }
  if (fromCode === toCode) {
    return { ok: false, message: "From and to can't be the same location." };
  }
  if (input.newAirline && (!input.newAirline.name.trim() || !input.newAirline.color.trim())) {
    return { ok: false, message: "New operator needs a name and color." };
  }
  if (input.newFrom && (!input.newFrom.city.trim() || !input.newFrom.country.trim())) {
    return { ok: false, message: "New 'from' location needs a city and country." };
  }
  if (input.newTo && (!input.newTo.city.trim() || !input.newTo.country.trim())) {
    return { ok: false, message: "New 'to' location needs a city and country." };
  }
  const departAt = new Date(input.departAt);
  const arriveAt = new Date(input.arriveAt);
  if (Number.isNaN(departAt.getTime()) || Number.isNaN(arriveAt.getTime())) {
    return { ok: false, message: "Departure and arrival need valid dates/times." };
  }
  if (arriveAt <= departAt) {
    return { ok: false, message: "Arrival must be after departure." };
  }
  if (!(input.price > 0) || !(input.seatsTotal > 0)) {
    return { ok: false, message: "Price and total seats must be greater than zero." };
  }

  try {
    const supabase = await createClient();

    if (input.newAirline) {
      const { error } = await supabase
        .from("airlines")
        .upsert({ code: airlineCode, name: input.newAirline.name.trim(), color: input.newAirline.color, logo_url: null });
      if (error) throw error;
    }

    for (const [code, loc] of [
      [fromCode, input.newFrom],
      [toCode, input.newTo],
    ] as const) {
      if (!loc) continue;
      const { error } = await supabase.from("airports").upsert({
        code,
        city: loc.city.trim(),
        name: loc.name.trim() || loc.city.trim(),
        country: loc.country.trim(),
        region: loc.region,
        lat: loc.lat || 0,
        lng: loc.lng || 0,
      });
      if (error) throw error;
    }

    const { error } = await supabase.from("flights").insert({
      flight_number: flightNumber,
      airline_code: airlineCode,
      from_code: fromCode,
      to_code: toCode,
      depart_at: departAt.toISOString(),
      arrive_at: arriveAt.toISOString(),
      cabin: input.cabin,
      price: input.price,
      seats_total: input.seatsTotal,
      seats_left: input.seatsTotal,
      stops: input.stops,
      mode: input.mode,
      status: "scheduled",
    });
    if (error) throw error;

    await logAdminAction("flights.create", { flightNumber, mode: input.mode, from: fromCode, to: toCode });
    revalidateRoutePages();
    return { ok: true, message: "Route added." };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error
          ? `${err.message} — you likely need an authenticated admin session (RLS blocks anonymous writes).`
          : "Failed to add route.",
    };
  }
}

export async function setRouteStatus(
  id: string,
  status: "scheduled" | "cancelled"
): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Preview only — connect Supabase to persist changes." };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("flights").update({ status }).eq("id", id);
    if (error) throw error;
    await logAdminAction("flights.set_status", { id, status });
    revalidateRoutePages();
    return { ok: true, message: "Updated." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Failed to update status." };
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Seat control
// ─────────────────────────────────────────────────────────────────────────

export type SeatMapState = {
  booked: string[];
  blocked: string[];
  seatsLeft: number | null;
  seatsTotal: number | null;
};

/** Sold seats and admin-withheld seats for one departure, kept apart so the
 *  admin map can show sold ones as immovable. */
export async function getFlightSeatMap(flightId: string): Promise<SeatMapState> {
  const empty: SeatMapState = { booked: [], blocked: [], seatsLeft: null, seatsTotal: null };
  if (!isSupabaseConfigured) return empty;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_seat_map", { p_flight_id: flightId });
    if (error || !data) return empty;
    return {
      booked: data.booked ?? [],
      blocked: data.blocked ?? [],
      seatsLeft: data.seats_left ?? null,
      seatsTotal: data.seats_total ?? null,
    };
  } catch {
    return empty;
  }
}

export async function setBlockedSeats(
  flightId: string,
  seats: string[]
): Promise<{ ok: boolean; message?: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Supabase is not configured." };
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("set_blocked_seats", {
      p_flight_id: flightId,
      p_seats: seats,
    });
    if (error) return { ok: false, message: error.message };
    if (!data?.success) return { ok: false, message: data?.message ?? "Could not update seats." };

    await logAdminAction("flight.seats_blocked", { flightId, count: seats.length });
    revalidatePath("/admin/flights");
    // The traveler-facing seat map reads the same data, so it has to drop
    // its cached copy or a blocked seat stays selectable until it expires.
    revalidatePath(`/booking/${flightId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not update seats." };
  }
}

/** Fills a share of each selected departure's seat map — either withheld
 *  (blocked) or written as demo bookings (sold). */
export async function randomizeSeats(
  flightIds: string[],
  fill: "blocked" | "sold",
  density: number
): Promise<{ ok: boolean; message?: string; routes?: number; seats?: number }> {
  if (!isSupabaseConfigured) return { ok: false, message: "Supabase is not configured." };
  if (flightIds.length === 0) return { ok: false, message: "Select at least one departure." };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("randomize_seats", {
      p_flight_ids: flightIds,
      p_fill: fill,
      p_density: density,
    });
    if (error) return { ok: false, message: error.message };
    if (!data?.success) return { ok: false, message: data?.message ?? "Could not fill seats." };

    await logAdminAction("flight.seats_randomized", { fill, density, routes: data.routes });
    revalidatePath("/admin/flights");
    return { ok: true, routes: data.routes, seats: data.seats };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not fill seats." };
  }
}

/** Releases every admin-held seat and deletes demo bookings, returning the
 *  seats to inventory. Real bookings are left alone. */
export async function clearDemoOccupancy(
  flightIds?: string[]
): Promise<{ ok: boolean; message?: string; bookings?: number }> {
  if (!isSupabaseConfigured) return { ok: false, message: "Supabase is not configured." };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("clear_demo_occupancy", {
      p_flight_ids: flightIds && flightIds.length > 0 ? flightIds : undefined,
    });
    if (error) return { ok: false, message: error.message };
    if (!data?.success) return { ok: false, message: data?.message ?? "Could not clear." };

    await logAdminAction("flight.demo_occupancy_cleared", { bookings: data.bookings });
    revalidatePath("/admin/flights");
    return { ok: true, bookings: data.bookings };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not clear." };
  }
}
