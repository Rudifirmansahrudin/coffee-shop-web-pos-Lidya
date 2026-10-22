import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getRole } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Mission Control",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getRole();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell role={session.role} name={session.name} mode={session.mode}>
      {children}
    </AdminShell>
  );
}