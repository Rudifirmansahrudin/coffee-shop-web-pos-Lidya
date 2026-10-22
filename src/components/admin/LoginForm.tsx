"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/admin-nav";

const demoEnabled = process.env.NEXT_PUBLIC_DEMO_ADMIN === "true";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(payload: Record<string, string>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Gagal masuk. Coba lagi.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function onPasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    void submit({ mode: "password", email, password });
  }

  function onDemoLogin(role: Role) {
    void submit({ mode: "demo", role });
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-line bg-surface px-3 text-base text-ink placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy";

  return (
    <div className="space-y-6">
      <form onSubmit={onPasswordLogin} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="admin-email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="admin-password" className="text-sm font-medium text-ink">
            Kata sandi
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl bg-matcha px-4 font-semibold text-space-navy disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      {demoEnabled && (
        <div className="space-y-3 border-t border-line pt-5">
          <p className="text-sm text-muted">Mode demo (untuk presentasi)</p>
          <div className="grid gap-2">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                disabled={loading}
                onClick={() => onDemoLogin(role)}
                className="h-11 rounded-xl border border-line bg-surface px-4 text-sm font-medium text-ink hover:bg-matcha-soft disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy"
              >
                Masuk sebagai {ROLE_LABELS[role]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}