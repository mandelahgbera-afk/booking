"use client";

import { useEffect, useRef } from "react";

// A cheap hand-rolled "shader" — animated blurred gradient blobs drifting on
// a canvas via sine motion. No WebGL/GLSL dependency, no external assets,
// just requestAnimationFrame + radial gradients, so it's zero-risk to ship
// and costs nothing to load.
export const ShaderBackground = ({ className = "" }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const blobs = [
      { x: 0.2, y: 0.3, r: 0.55, hue: 24, speed: 0.6, phase: 0 }, // orange
      { x: 0.8, y: 0.4, r: 0.5, hue: 217, speed: 0.5, phase: 2 }, // blue
      { x: 0.5, y: 0.75, r: 0.6, hue: 35, speed: 0.4, phase: 4 }, // amber
    ];

    const start = performance.now();

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (const b of blobs) {
        const cx = (b.x + Math.sin(t * b.speed + b.phase) * 0.08) * width;
        const cy = (b.y + Math.cos(t * b.speed * 0.8 + b.phase) * 0.08) * height;
        const r = b.r * Math.max(width, height) * 0.6;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        gradient.addColorStop(0, `hsla(${b.hue}, 95%, 60%, 0.20)`);
        gradient.addColorStop(1, `hsla(${b.hue}, 95%, 60%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
};
