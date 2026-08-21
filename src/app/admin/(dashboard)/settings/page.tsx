import { getPlatformSettings } from "@/lib/data";
import { PlatformSettingsForm } from "@/components/admin/PlatformSettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getPlatformSettings();

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
      <p className="mt-1 text-sm text-slate-500">
        This panel controls live behavior across the whole site — the mock payment
        gateway, booking availability, and pricing.
      </p>

      <div className="mt-6 max-w-2xl">
        <PlatformSettingsForm settings={settings} />
      </div>
    </div>
  );
}
