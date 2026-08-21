"use client";

import { useMemo } from "react";
import Map, { Marker, Source, Layer, NavigationControl } from "react-map-gl/mapbox";
import type { LayerProps } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { PlaneTakeoff } from "lucide-react";
import type { Airport } from "@/lib/mock-data";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Great-circle-ish arc between two points, for a nicer curved flight path
// than a straight line.
function arcCoordinates(
  from: [number, number],
  to: [number, number],
  steps = 64
): [number, number][] {
  const [lng1, lat1] = from;
  const [lng2, lat2] = to;
  const midLng = (lng1 + lng2) / 2;
  const midLat = (lat1 + lat2) / 2;
  const dist = Math.hypot(lng2 - lng1, lat2 - lat1);
  const liftLat = midLat + dist * 0.15;

  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lng = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * midLng + t * t * lng2;
    const lat =
      (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * liftLat + t * t * lat2;
    coords.push([lng, lat]);
  }
  return coords;
}

const routeLayer: LayerProps = {
  id: "route",
  type: "line",
  source: "route",
  layout: { "line-join": "round", "line-cap": "round" },
  paint: { "line-color": "#f97316", "line-width": 3, "line-dasharray": [0.2, 1.6] },
};

export const RouteMap = ({ from, to }: { from: Airport; to: Airport }) => {
  const coords = useMemo(
    () => arcCoordinates([from.lng, from.lat], [to.lng, to.lat]),
    [from, to]
  );

  const geojson = useMemo(
    () => ({
      type: "Feature" as const,
      properties: {},
      geometry: { type: "LineString" as const, coordinates: coords },
    }),
    [coords]
  );

  const centerLng = (from.lng + to.lng) / 2;
  const centerLat = (from.lat + to.lat) / 2;

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full min-h-[280px] w-full flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
        <PlaneTakeoff size={22} />
        Set NEXT_PUBLIC_MAPBOX_TOKEN to preview the route map
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[280px] w-full overflow-hidden rounded-3xl border border-slate-200">
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{ longitude: centerLng, latitude: centerLat, zoom: 2.2 }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <Source id="route" type="geojson" data={geojson}>
          <Layer {...routeLayer} />
        </Source>

        <Marker longitude={from.lng} latitude={from.lat} anchor="bottom">
          <AirportPin code={from.code} />
        </Marker>
        <Marker longitude={to.lng} latitude={to.lat} anchor="bottom">
          <AirportPin code={to.code} />
        </Marker>
      </Map>
    </div>
  );
};

const AirportPin = ({ code }: { code: string }) => (
  <div className="flex flex-col items-center">
    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white shadow">
      {code}
    </span>
    <span className="mt-0.5 h-2 w-2 rounded-full border-2 border-white bg-orange-500 shadow" />
  </div>
);
