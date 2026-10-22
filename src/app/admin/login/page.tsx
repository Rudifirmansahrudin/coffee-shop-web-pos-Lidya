import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { getRole } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Masuk Mission Control",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getRole();
  if (session) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <h1 className="font-heading text-2xl font-bold text-space-navy">Mission Control</h1>
        <p className="mb-6 mt-1 text-sm text-muted">Masuk untuk mengelola Space Coffee and Matcha.</p>
        <LoginForm />
      </div>
    </main>
  );
}