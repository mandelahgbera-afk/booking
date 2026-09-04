"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const mode = offer.mode ?? "flight";
  const { from, to } = offer;
  const ModeIcon = MODE_ICON[mode];

  // Mapbox GL needs WebGL. Where it's unavailable (hardened browsers,
  // some embedded webviews, blocking extensions) the canvas mounts but
  // paints nothing — a blank grey box with no explanation. Detect that up
  // front, and also catch runtime failures via onError, so this component
  // always renders something meaningful instead of dead space.
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  // The commonest real-world failure isn't WebGL — it's the Mapbox tile CDN
  // being blocked (privacy extensions and ad blockers routinely do this),
  // which leaves a mounted canvas painting nothing at all. Mapbox surfaces
  // no reliable event for that, so treat "style never finished loading" as
  // the signal and fall back rather than leave a blank panel.
  // This used to be a 6s hard deadline, which is a race rather than a
  // diagnosis: a cold Mapbox load over a slow phone connection routinely
  // takes longer, so the map would fall back to the static route even
  // though it was seconds from painting — and never recovered once it had.
  // That is the "sometimes it shows, sometimes it doesn't" behaviour. The
  // window is now generous enough to only catch genuinely-blocked tiles,
  // and onLoad clears the failure if the style does arrive late.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!loadedRef.current) setFailed(true);
    }, 15000);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    // Deferred a frame so this reads as subscribing to an external
    // capability rather than a synchronous setState cascade during commit.
    const id = requestAnimationFrame(() => {
      let supported = false;
      try {
        const probe = document.createElement("canvas");
        supported = Boolean(probe.getContext("webgl") || probe.getContext("experimental-webgl"));
      } catch {
        supported = false;
      }
      if (!supported) setFailed(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

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
    loadedRef.current = true;
    setLoaded(true);
    // The style arrived after all — undo a timeout-driven fallback.
    setFailed(false);
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
    // Gated on `loaded`: calling fitBounds before the style is ready
    // silently does nothing, which left long routes framed at the
    // initial zoom with both endpoints off-screen.
    if (!map || !loaded) return;
    map.fitBounds(
      [
        [Math.min(from.lng, to.lng), Math.min(from.lat, to.lat)],
        [Math.max(from.lng, to.lng), Math.max(from.lat, to.lat)],
      ],
      { padding: { top: 72, bottom: 56, left: 56, right: 56 }, duration: 700, maxZoom: 7 }
    );
  }, [from.lng, from.lat, to.lng, to.lat, loaded]);

  // A map that mounts inside a collapsed or freshly-revealed container gets
  // a zero-size canvas and paints nothing until something forces a resize.
  // Observing the container covers tab switches and orientation changes,
  // which on a phone is the difference between a map and a grey box.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !loaded) return;
    const ro = new ResizeObserver(() => mapRef.current?.resize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [loaded]);

  const summary = (
    <RouteSummary offer={offer} mode={mode} ModeIcon={ModeIcon} />
  );

  if (!MAPBOX_TOKEN || failed) {
    return <StaticRoute offer={offer} mode={mode} summary={summary} />;
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-[300px] w-full overflow-hidden rounded-3xl border border-slate-200"
    >
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        onLoad={onLoad}
        onError={() => {
          // Mapbox fires `error` for transient things too — a single 404
          // tile, an aborted request on navigation. Tearing the whole map
          // down for one of those was a large part of the flakiness, so
          // only treat an error as fatal if the style never loaded at all.
          if (!loadedRef.current) setFailed(true);
        }}
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

      {summary}
    </div>
  );
};

// Shared by the live map and the static fallback so the two never drift.
const RouteSummary = ({
  offer,
  mode,
  ModeIcon,
}: {
  offer: FlightOffer;
  mode: NonNullable<FlightOffer["mode"]>;
  ModeIcon: (typeof MODE_ICON)[keyof typeof MODE_ICON];
}) => (
  <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-sm">
    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
      <ModeIcon size={15} className="text-orange-500" />
      {offer.from.city} &rarr; {offer.to.city}
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
    <span className="sr-only">{mode} route</span>
  </div>
);

// Dependency-free branded route visual. Not a geographic map — it makes no
// such claim — just an honest schematic so the panel still communicates the
// route when the real map can't draw.
const StaticRoute = ({
  offer,
  mode,
  summary,
}: {
  offer: FlightOffer;
  mode: NonNullable<FlightOffer["mode"]>;
  summary: React.ReactNode;
}) => (
  <div className="relative h-full min-h-[300px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
    {summary}
    <svg viewBox="0 0 400 150" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      <path
        d={`M 45 108 Q 200 ${mode === "flight" ? 28 : 82} 355 108`}
        fill="none"
        stroke="#f97316"
        strokeWidth="2.5"
        strokeLinecap="round"
        {...(mode === "flight" ? { strokeDasharray: "1 6" } : {})}
      />
      {[
        { x: 45, code: offer.from.code, city: offer.from.city, anchor: "start" as const },
        { x: 355, code: offer.to.code, city: offer.to.city, anchor: "end" as const },
      ].map((p) => (
        <g key={p.code}>
          <circle cx={p.x} cy={108} r={5.5} fill="#f97316" stroke="#fff" strokeWidth="2.5" />
          <text x={p.x} y={130} textAnchor="middle" className="fill-slate-900" fontSize="13" fontWeight="700">
            {p.code}
          </text>
          <text x={p.x} y={144} textAnchor="middle" className="fill-slate-400" fontSize="10">
            {p.city}
          </text>
        </g>
      ))}
    </svg>
  </div>
);

const StopPin = ({ code, city }: { code: string; city: string }) => (
  <div className="flex flex-col items-center">
    <span className="whitespace-nowrap rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
      {code}
      <span className="ml-1 font-normal text-white/60">{city}</span>
    </span>
    <span className="mt-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-orange-500 shadow" />
  </div>
);
