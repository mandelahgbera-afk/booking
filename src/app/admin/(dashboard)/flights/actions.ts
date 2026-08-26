"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { logAdminAction } from "@/lib/data";

export type NewLocation = {
  city: string;
  name: string;
  country: string;
  region: "USA" | "Asia" | "UK" | "Other";
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
