import DemoPanel from "@/components/admin/DemoPanel";
import { getAdminRole } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export default async function AdminDemoPage() {
  const role = await getAdminRole();

  if (role !== "owner") {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6">
        <h1 className="font-heading text-xl font-semibold text-ink">Panel Demo</h1>
        <p className="mt-2 text-sm text-muted">Halaman ini hanya untuk Owner. Ganti peran lewat menu di header.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Panel Demo</h1>
        <p className="text-sm text-muted">Alat bantu presentasi. Semua data yang dibuat bertanda DUMMY.</p>
      </div>
      <DemoPanel />
    </div>
  );
}