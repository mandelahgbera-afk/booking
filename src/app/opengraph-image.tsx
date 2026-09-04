import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 55%, #fff7ed 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            }}
          >
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 16.5v-2l-8.5-5V4.5c0-1-.8-2-1.8-2s-1.7 1-1.7 2v5l-8.5 5v2l8.5-2.6V17l-2.5 2v1.5l4-1.2 4 1.2V19l-2.5-2v-3.1l8.5 2.6Z"
                fill="white"
              />
            </svg>
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, color: "#0f172a" }}>AirFly</div>
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 34,
            fontWeight: 600,
            color: "#334155",
            textAlign: "center",
          }}
        >
          Fly anywhere, book with confidence
        </div>
        <div style={{ marginTop: 14, fontSize: 24, color: "#64748b" }}>
          Flights across six continents
        </div>
      </div>
    ),
    { ...size }
  );
}
