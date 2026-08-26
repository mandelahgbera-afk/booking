"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

// Renders a QR code with the AirFly mark watermarked in the center.
// Uses "H" error correction (recovers up to ~30% damage/obscured area) and
// caps the logo at ~22% of the code's width — comfortably inside that
// budget, which is the same margin real-world QR-with-logo generators
// (payment apps, wallets) use to stay reliably scannable. If a caller ever
// needs a guaranteed-plain code, pass `logo={false}`.
export const QrCode = ({
  value,
  size = 160,
  logo = true,
  className,
}: {
  value: string;
  size?: number;
  logo?: boolean;
  className?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;
    let cancelled = false;
    QRCode.toCanvas(canvas, value, {
      width: size,
      margin: 1,
      errorCorrectionLevel: "H",
      color: { dark: "#0f172a", light: "#ffffff" },
    }).then(() => {
      if (cancelled || !logo) return;
      const ctx = canvas.getContext("2d");
      if (ctx) drawLogo(ctx, size);
    });
    return () => {
      cancelled = true;
    };
  }, [value, size, logo]);

  if (!value) return null;
  return <canvas ref={canvasRef} className={className} />;
};

// Same plane glyph as src/app/icon.tsx / the navbar mark, drawn on a white
// rounded backing so it stays crisp against the QR's dark modules.
function drawLogo(ctx: CanvasRenderingContext2D, size: number) {
  const logoSize = size * 0.22;
  const cx = size / 2;
  const cy = size / 2;
  const pad = logoSize * 0.14;

  ctx.save();
  roundedRect(ctx, cx - logoSize / 2 - pad, cy - logoSize / 2 - pad, logoSize + pad * 2, logoSize + pad * 2, 8);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundedRect(ctx, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize, 6);
  const gradient = ctx.createLinearGradient(
    cx - logoSize / 2,
    cy - logoSize / 2,
    cx + logoSize / 2,
    cy + logoSize / 2
  );
  gradient.addColorStop(0, "#f97316");
  gradient.addColorStop(1, "#ea580c");
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();

  ctx.save();
  const scale = (logoSize * 0.6) / 24;
  const glyphSize = 24 * scale;
  ctx.translate(cx - glyphSize / 2, cy - glyphSize / 2);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.fill(
    new Path2D(
      "M22 16.5v-2l-8.5-5V4.5c0-1-.8-2-1.8-2s-1.7 1-1.7 2v5l-8.5 5v2l8.5-2.6V17l-2.5 2v1.5l4-1.2 4 1.2V19l-2.5-2v-3.1l8.5 2.6Z"
    )
  );
  ctx.restore();
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
