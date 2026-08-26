"use client";

import { useState } from "react";
import { Mail, Smartphone, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type Template = {
  key: string;
  label: string;
  trigger: string;
  subject: string;
  html: string;
};

export const EmailPreviewGallery = ({ templates }: { templates: Template[] }) => {
  const [active, setActive] = useState(templates[0]?.key);
  const [mobile, setMobile] = useState(false);
  const current = templates.find((t) => t.key === active) ?? templates[0];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-2">
        {templates.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={cn(
              "rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
              active === t.key ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <div className="flex items-center gap-2">
              <Mail size={14} className="shrink-0" />
              {t.label}
            </div>
            <div className="mt-0.5 pl-[22px] text-xs font-normal text-slate-400">{t.trigger}</div>
          </button>
        ))}
      </div>

      {current && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div>
              <div className="text-xs text-slate-400">Subject</div>
              <div className="text-sm font-semibold text-slate-900">{current.subject}</div>
            </div>
            <div className="flex gap-1 rounded-full border border-slate-200 p-1">
              <button
                onClick={() => setMobile(false)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full",
                  !mobile ? "bg-slate-900 text-white" : "text-slate-400"
                )}
                aria-label="Desktop preview"
              >
                <Monitor size={14} />
              </button>
              <button
                onClick={() => setMobile(true)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full",
                  mobile ? "bg-slate-900 text-white" : "text-slate-400"
                )}
                aria-label="Mobile preview"
              >
                <Smartphone size={14} />
              </button>
            </div>
          </div>

          <div className="flex justify-center bg-slate-100 p-6">
            <iframe
              title={current.label}
              srcDoc={current.html}
              className="bg-white shadow-sm"
              style={{
                width: mobile ? 375 : "100%",
                maxWidth: mobile ? 375 : 700,
                height: 720,
                border: "none",
                borderRadius: 12,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
