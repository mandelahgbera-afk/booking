import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          borderRadius: 7,
        }}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path
            d="M22 16.5v-2l-8.5-5V4.5c0-1-.8-2-1.8-2s-1.7 1-1.7 2v5l-8.5 5v2l8.5-2.6V17l-2.5 2v1.5l4-1.2 4 1.2V19l-2.5-2v-3.1l8.5 2.6Z"
            fill="white"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
