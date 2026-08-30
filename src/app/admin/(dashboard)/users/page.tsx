import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminUsers } from "@/lib/admin-mock";

export default function AdminUsersPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Users</h1>
      <p className="mt-1 text-sm text-slate-500">
        Everyone with an account on AirFly.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-2">
        <div className="overflow-x-auto">
          <table className="w-full md:min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="hidden md:table-cell p-4 font-medium">Bookings</th>
                <th className="hidden md:table-cell p-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="p-4 font-medium text-slate-700">{u.name}</td>
                  <td className="p-4 text-slate-500">{u.email}</td>
                  <td className="p-4">
                    <StatusBadge status={u.role === "admin" ? "confirmed" : "scheduled"} />
                  </td>
                  <td className="hidden md:table-cell p-4 text-slate-500">{u.bookings}</td>
                  <td className="hidden md:table-cell p-4 text-slate-500">{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
