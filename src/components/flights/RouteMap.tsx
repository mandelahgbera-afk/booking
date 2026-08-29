"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Map, { Marker, Source, Layer, NavigationControl, type MapRef } from "react-map-gl/mapbox";
import type { LayerProps, MapEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Bus, Clock, PlaneTakeoff, TrainFront } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { FlightOffer } from "@/lib/mock-data";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Brand palette — deliberately monochrome slate so the orange route line is
// the only saturated thing on the map. Mapbox's stock light-v11 is a generic
// grey-and-blue basemap; these overrides make it read as part of the site
// rather than an embedded third-party widget.
const PAINT: [string, string, string][] = [
  ["land", "background-color", "#f8fafc"],
  ["landcover", "fill-color", "#f1f5f9"],
  ["national-park", "fill-color", "#f1f5f9"],
  ["landuse", "fill-color", "#f1f5f9"],
  ["water", "fill-color", "#e2e8f0"],
  ["waterway", "line-color", "#e2e8f0"],
  ["building", "fill-color", "#eef2f6"],
];

// Clutter that adds nothing at route-overview zoom levels.
const HIDE = ["road-label", "road-number-shield", "poi-label", "transit-label", "building-number-label"];

// Ground routes hug the earth; flights arc. Keeping them visually distinct
// matters now that this same component serves /flights, /trains and /buses.
const ARC_LIFT: Record<NonNullable<FlightOffer["mode"]>, number> = {
  flight: 0.18,
  train: 0.05,
  bus: 0.05,
};

const MODE_ICON = { flight: PlaneTakeoff, train: TrainFront, bus: Bus } as const;

function arcCoordinates(
  from: [number, number],
  to: [number, number],
  lift: number,
  steps = 72
): [number, number][] {
  const [lng1, lat1] = from;
  const [lng2, lat2] = to;
  const midLng = (lng1 + lng2) / 2;
  const dist = Math.hypot(lng2 - lng1, lat2 - lat1);
  const liftLat = (lat1 + lat2) / 2 + dist * lift;

  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    coords.push([
      (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * midLng + t * t * lng2,
      (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * liftLat + t * t * lat2,
    ]);
  }
  return coords;
}

function formatDuration(mins: number) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export const RouteMap = ({ offer }: { offer: FlightOffer }) => {
  const mapRef = useRef<MapRef>(null);
  const mode = offer.mode ?? "flight";
  const { from, to } = offer;
  const ModeIcon = MODE_ICON[mode];

  const geojson = useMemo(
    () => ({
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: arcCoordinates([from.lng, from.lat], [to.lng, to.lat], ARC_LIFT[mode]),
      },
    }),
    [from.lng, from.lat, to.lng, to.lat, mode]
  );

  // A flight arc is dashed (it isn't a real ground path); rail and coach
  // follow actual corridors, so they read as solid.
  const routeLayer: LayerProps = useMemo(
    () => ({
      id: "route",
      type: "line",
      source: "route",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": "#f97316",
        "line-width": 3,
        ...(mode === "flight" ? { "line-dasharray": [0.2, 1.6] } : {}),
      },
    }),
    [mode]
  );

  const onLoad = useCallback((e: MapEvent) => {
    const map = e.target;
    // setPaintProperty's property name is a huge literal union; these are
    // valid members but only known as string here, so the call is narrowed
    // locally rather than weakening the whole map typing.
    const setPaint = map.setPaintProperty.bind(map) as (l: string, p: string, v: unknown) => void;

    for (const [layer, prop, value] of PAINT) {
      // Stock style layer ids aren't a stable contract, so every override is
      // guarded — a renamed layer degrades to Mapbox's default, never throws.
      try {
        if (map.getLayer(layer)) setPaint(layer, prop, value);
      } catch {
        /* layer missing in this style version — skip */
      }
    }
    for (const layer of HIDE) {
      try {
        if (map.getLayer(layer)) map.setLayoutProperty(layer, "visibility", "none");
      } catch {
        /* same */
      }
    }
  }, []);

  // Frame the actual route. The previous version hardcoded zoom 2.2, which
  // is continental scale — fine for JFK→LHR, useless for a 300km train hop.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.fitBounds(
      [
        [Math.min(from.lng, to.lng), Math.min(from.lat, to.lat)],
        [Math.max(from.lng, to.lng), Math.max(from.lat, to.lat)],
      ],
      { padding: { top: 72, bottom: 56, left: 56, right: 56 }, duration: 700, maxZoom: 7 }
    );
  }, [from.lng, from.lat, to.lng, to.lat]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full min-h-[280px] w-full flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
        <ModeIcon size={22} />
        Set NEXT_PUBLIC_MAPBOX_TOKEN to preview the route map
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[300px] w-full overflow-hidden rounded-3xl border border-slate-200">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        onLoad={onLoad}
        initialViewState={{
          longitude: (from.lng + to.lng) / 2,
          latitude: (from.lat + to.lat) / 2,
          zoom: 3,
        }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <Source id="route" type="geojson" data={geojson}>
          <Layer {...routeLayer} />
        </Source>

        <Marker longitude={from.lng} latitude={from.lat} anchor="bottom">
          <StopPin code={from.code} city={from.city} />
        </Marker>
        <Marker longitude={to.lng} latitude={to.lat} anchor="bottom">
          <StopPin code={to.code} city={to.city} />
        </Marker>
      </Map>

      {/* Route summary — turns a decorative basemap into something that
          actually tells you what you're looking at. */}
      <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-sm">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
          <ModeIcon size={15} className="text-orange-500" />
          {from.city} → {to.city}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Clock size={12} />
          {formatDuration(offer.durationMins)}
        </span>
        <span className="text-xs text-slate-400">
          {offer.stops === 0 ? "Nonstop" : `${offer.stops} stop`}
        </span>
        <span className="ml-auto text-sm font-bold text-slate-900">
          from {formatCurrency(offer.price)}
        </span>
      </div>
    </div>
  );
};

const StopPin = ({ code, city }: { code: string; city: string }) => (
  <div className="flex flex-col items-center">
    <span className="whitespace-nowrap rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
      {code}
      <span className="ml-1 font-normal text-white/60">{city}</span>
    </span>
    <span className="mt-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-orange-500 shadow" />
  </div>
);
