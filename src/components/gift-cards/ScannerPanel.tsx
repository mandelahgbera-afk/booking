"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, ScanLine, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";

type ScanState = "requesting" | "scanning" | "detected" | "denied" | "unsupported";

// Real camera-based QR scanning (not a fake timer) — jsQR decodes actual
// video frames client-side, nothing is uploaded anywhere. Point it at any
// AIRFLY-XXXX-XXXX code (e.g. one generated on /admin/gift-cards, or the
// demo codes in supabase/seed.sql) and it reads it live.
export const ScannerPanel = ({ onDetected }: { onDetected: (code: string) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [state, setState] = useState<ScanState>(() =>
    typeof navigator !== "undefined" && "mediaDevices" in navigator
      ? "requesting"
      : "unsupported"
  );

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaDevices" in navigator)) {
      return;
    }

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setState("scanning");
        tick();
      })
      .catch(() => setState("denied"));

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (result?.data) {
        setState("detected");
        onDetected(result.data);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-3xl bg-slate-900">
      <video
        ref={videoRef}
        muted
        playsInline
        className={cn(
          "h-full w-full object-cover transition-opacity",
          state === "scanning" || state === "detected" ? "opacity-100" : "opacity-0"
        )}
      />
      <canvas ref={canvasRef} className="hidden" />

      {(state === "requesting" || state === "denied" || state === "unsupported") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white/70">
          {state === "requesting" && (
            <>
              <Camera size={28} className="animate-pulse" />
              <p className="text-sm">Requesting camera access…</p>
            </>
          )}
          {state === "denied" && (
            <>
              <VideoOff size={28} />
              <p className="text-sm">
                Camera access was denied. Use &ldquo;Enter code&rdquo; below instead.
              </p>
            </>
          )}
          {state === "unsupported" && (
            <>
              <VideoOff size={28} />
              <p className="text-sm">
                Camera scanning isn&apos;t supported on this device. Use &ldquo;Enter code&rdquo; below.
              </p>
            </>
          )}
        </div>
      )}

      {(state === "scanning" || state === "detected") && (
        <div className="pointer-events-none absolute inset-0">
          {/* corner brackets */}
          {[
            "left-6 top-6 border-l-2 border-t-2",
            "right-6 top-6 border-r-2 border-t-2",
            "left-6 bottom-6 border-l-2 border-b-2",
            "right-6 bottom-6 border-r-2 border-b-2",
          ].map((pos) => (
            <div
              key={pos}
              className={cn(
                "absolute h-8 w-8 rounded-sm border-orange-400 transition-colors",
                pos,
                state === "detected" && "border-emerald-400"
              )}
            />
          ))}

          {/* animated scan line */}
          {state === "scanning" && (
            <div className="absolute inset-x-6 top-6 h-0.5 animate-[scan_2.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_12px_2px_rgba(249,115,22,0.6)]" />
          )}

          {state === "scanning" && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-xs text-white/80 backdrop-blur">
              <ScanLine size={12} /> Point at a gift card QR code
            </div>
          )}
        </div>
      )}
    </div>
  );
};
