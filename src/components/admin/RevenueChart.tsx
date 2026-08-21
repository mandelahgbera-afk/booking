"use client";

import { useId, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";

export const RevenueChart = ({ data }: { data: number[] }) => {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);

  const width = 600;
  const height = 200;
  const max = Math.max(...data);
  const min = Math.min(...data);

  const points = useMemo(
    () =>
      data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / (max - min || 1)) * (height - 20) - 10;
        return [x, y] as const;
      }),
    [data, max, min]
  );

  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  const active = hover !== null ? points[hover] : points[points.length - 1];
  const activeValue = hover !== null ? data[hover] : data[data.length - 1];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke="#f97316" strokeWidth={2.5} />

        {active && (
          <>
            <line
              x1={active[0]}
              x2={active[0]}
              y1={0}
              y2={height}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
            <circle cx={active[0]} cy={active[1]} r={5} fill="#f97316" stroke="white" strokeWidth={2} />
          </>
        )}

        {points.map(([x], i) => (
          <rect
            key={i}
            x={x - width / data.length / 2}
            y={0}
            width={width / data.length}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>

      <div className="pointer-events-none absolute -top-2 left-0 text-sm font-bold text-slate-900">
        {formatCurrency(activeValue)}
        <span className="ml-1 text-xs font-normal text-slate-400">
          {hover === null ? "today" : `${data.length - hover}h ago`}
        </span>
      </div>
    </div>
  );
};
