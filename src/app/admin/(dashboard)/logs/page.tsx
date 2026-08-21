import { ScrollText } from "lucide-react";
import { getAdminLogs } from "@/lib/data";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminLogsPage() {
  const logs = await getAdminLogs();

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin Logs</h1>
      <p className="mt-1 text-sm text-slate-500">
        Audit trail of every change made from this console — who did what, and when.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-2">
        {logs.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">
            No admin activity yet.
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {logs.map((log) => (
              <li key={log.id} className="flex items-start gap-3 p-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                  <ScrollText size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {log.adminName}
                    </span>
                    <span className="font-mono text-xs text-slate-400">{log.action}</span>
                  </div>
                  {Object.keys(log.details).length > 0 && (
                    <pre className="mt-1 overflow-x-auto rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500">
                      {JSON.stringify(log.details)}
                    </pre>
                  )}
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {formatWhen(log.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
