"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";

type Role = "owner" | "cashier" | "barista";
type Category = { id: string; name: string };
type Product = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  price_large: number | null;
  image_url: string | null;
  is_available: boolean;
  is_best_seller: boolean;
  stock_note: string | null;
};
type Topping = { id: string; name: string; price: number; is_available: boolean };

type ProductForm = {
  id?: string;
  category_id: string;
  name: string;
  description: string;
  price: string;
  price_large: string;
  image_url: string;
  stock_note: string;
  is_available: boolean;
  is_best_seller: boolean;
};

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

async function call(url: string, method: string, body?: unknown) {
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, message: data.message ?? "Terjadi kesalahan." };
    return { ok: true, message: "" };
  } catch {
    return { ok: false, message: "Koneksi bermasalah. Coba lagi." };
  }
}

function emptyForm(categoryId: string): ProductForm {
  return {
    category_id: categoryId,
    name: "",
    description: "",
    price: "",
    price_large: "",
    image_url: "",
    stock_note: "",
    is_available: true,
    is_best_seller: false,
  };
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`min-h-[44px] rounded-full px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy ${
        checked ? "bg-matcha-soft text-space-navy" : "bg-line text-ink"
      }`}
    >
      {checked ? "Tersedia" : "Habis"}
    </button>
  );
}

export default function ProductsManager({
  role,
  categories,
  products,
  toppings,
}: {
  role: Role;
  categories: Category[];
  products: Product[];
  toppings: Topping[];
}) {
  const router = useRouter();
  const isOwner = role === "owner";
  const [form, setForm] = useState<ProductForm | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [tName, setTName] = useState("");
  const [tPrice, setTPrice] = useState("");

  const catName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name ?? "-";

  async function run(promise: Promise<{ ok: boolean; message: string }>) {
    const r = await promise;
    setNotice(r.ok ? "" : r.message);
    if (r.ok) router.refresh();
    return r;
  }

  function openEdit(p: Product) {
    setFormError("");
    setForm({
      id: p.id,
      category_id: p.category_id ?? categories[0]?.id ?? "",
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      price_large: p.price_large === null ? "" : String(p.price_large),
      image_url: p.image_url ?? "",
      stock_note: p.stock_note ?? "",
      is_available: p.is_available,
      is_best_seller: p.is_best_seller,
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setFormError("");

    const payload = {
      category_id: form.category_id,
      name: form.name,
      description: form.description || null,
      price: Number(form.price),
      price_large: form.price_large === "" ? null : Number(form.price_large),
      image_url: form.image_url || null,
      stock_note: form.stock_note || null,
      is_available: form.is_available,
      is_best_seller: form.is_best_seller,
    };

    const r = form.id
      ? await call(`/api/admin/products/${form.id}`, "PATCH", payload)
      : await call("/api/admin/products", "POST", payload);

    setSaving(false);
    if (!r.ok) {
      setFormError(r.message);
      return;
    }
    setForm(null);
    router.refresh();
  }

  async function removeProduct(p: Product) {
    if (!window.confirm(`Hapus "${p.name}"?`)) return;
    await run(call(`/api/admin/products/${p.id}`, "DELETE"));
  }

  const toggleProduct = (p: Product) =>
    run(call(`/api/admin/products/${p.id}`, "PATCH", { is_available: !p.is_available }));

  const toggleTopping = (t: Topping) =>
    run(call(`/api/admin/toppings/${t.id}`, "PATCH", { is_available: !t.is_available }));

  async function addTopping(e: React.FormEvent) {
    e.preventDefault();
    const r = await run(
      call("/api/admin/toppings", "POST", {
        name: tName,
        price: Number(tPrice),
        is_available: true,
      })
    );
    if (r.ok) {
      setTName("");
      setTPrice("");
    }
  }

  async function removeTopping(t: Topping) {
    if (!window.confirm(`Hapus topping "${t.name}"?`)) return;
    await run(call(`/api/admin/toppings/${t.id}`, "DELETE"));
  }

  const inputCls =
    "min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 text-base text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl text-space-navy">Produk</h1>
        {isOwner && (
          <button
            type="button"
            onClick={() => {
              setFormError("");
              setForm(emptyForm(categories[0]?.id ?? ""));
            }}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-matcha px-4 font-semibold text-space-navy"
          >
            <Plus className="h-4 w-4" aria-hidden /> Tambah Produk
          </button>
        )}
      </div>

      {!isOwner && (
        <p className="rounded-xl bg-matcha-soft p-3 text-sm text-ink">
          Peran kamu hanya bisa mengubah status Tersedia/Habis.
        </p>
      )}
      {notice && (
        <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">
          {notice}
        </p>
      )}

      {products.length === 0 ? (
        <p className="rounded-2xl bg-surface p-6 text-center text-muted">
          Belum ada produk.
        </p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream text-muted">
                <tr>
                  <th className="p-3">Produk</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">REG</th>
                  <th className="p-3">LRG</th>
                  <th className="p-3">Status</th>
                  {isOwner && <th className="p-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-line">
                    <td className="p-3 font-semibold text-ink">
                      {p.name}
                      {p.is_best_seller && (
                        <span className="ml-2 rounded-full bg-star-gold/20 px-2 py-0.5 text-xs text-ink">
                          Best Seller
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-muted">{catName(p.category_id)}</td>
                    <td className="p-3">{rupiah(p.price)}</td>
                    <td className="p-3">
                      {p.price_large === null ? "-" : rupiah(p.price_large)}
                    </td>
                    <td className="p-3">
                      <Toggle
                        checked={p.is_available}
                        onChange={() => toggleProduct(p)}
                        label={`Ubah ketersediaan ${p.name}`}
                      />
                    </td>
                    {isOwner && (
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          aria-label={`Ubah ${p.name}`}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl hover:bg-cream"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeProduct(p)}
                          aria-label={`Hapus ${p.name}`}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-danger hover:bg-cream"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {products.map((p) => (
              <li key={p.id} className="rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{p.name}</p>
                    <p className="text-sm text-muted">{catName(p.category_id)}</p>
                    <p className="mt-1 text-sm">
                      {rupiah(p.price)}
                      {p.price_large !== null && ` / ${rupiah(p.price_large)}`}
                    </p>
                  </div>
                  <Toggle
                    checked={p.is_available}
                    onChange={() => toggleProduct(p)}
                    label={`Ubah ketersediaan ${p.name}`}
                  />
                </div>
                {isOwner && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="min-h-[44px] flex-1 rounded-xl border border-line font-semibold"
                    >
                      Ubah
                    </button>
                    <button
                      type="button"
                      onClick={() => removeProduct(p)}
                      className="min-h-[44px] flex-1 rounded-xl border border-danger font-semibold text-danger"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Toppings */}
      <section className="space-y-3">
        <h2 className="font-heading text-xl text-space-navy">Topping</h2>
        {toppings.length === 0 ? (
          <p className="rounded-2xl bg-surface p-4 text-muted">Belum ada topping.</p>
        ) : (
          <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
            {toppings.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 p-3">
                <div>
                  <p className="font-semibold text-ink">{t.name}</p>
                  <p className="text-sm text-muted">+{rupiah(t.price)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Toggle
                    checked={t.is_available}
                    onChange={() => toggleTopping(t)}
                    label={`Ubah ketersediaan ${t.name}`}
                  />
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => removeTopping(t)}
                      aria-label={`Hapus topping ${t.name}`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-danger hover:bg-cream"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        {isOwner && (
          <form onSubmit={addTopping} className="flex flex-col gap-2 sm:flex-row">
            <label className="flex-1">
              <span className="sr-only">Nama topping</span>
              <input
                className={inputCls}
                placeholder="Nama topping"
                value={tName}
                onChange={(e) => setTName(e.target.value)}
                required
              />
            </label>
            <label className="sm:w-40">
              <span className="sr-only">Harga topping</span>
              <input
                className={inputCls}
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="Harga (Rp)"
                value={tPrice}
                onChange={(e) => setTPrice(e.target.value)}
                required
              />
            </label>
            <button
              type="submit"
              className="min-h-[44px] rounded-xl bg-matcha px-4 font-semibold text-space-navy"
            >
              Tambah
            </button>
          </form>
        )}
      </section>

      {/* Product dialog: bottom sheet on mobile, centered on md+ */}
      {form && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-navy-bg/40 md:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={form.id ? "Ubah produk" : "Tambah produk"}
        >
          <form
            onSubmit={submit}
            className="max-h-[90vh] w-full space-y-3 overflow-y-auto rounded-t-2xl bg-surface p-5 md:max-w-lg md:rounded-2xl"
          >
            <h2 className="font-heading text-xl text-space-navy">
              {form.id ? "Ubah Produk" : "Tambah Produk"}
            </h2>

            <label className="block space-y-1">
              <span className="text-sm font-semibold">Nama</span>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-semibold">Kategori</span>
              <select
                className={inputCls}
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-sm font-semibold">Harga REG (Rp)</span>
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-semibold">Harga LRG (Rp)</span>
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="Kosong = 1 ukuran"
                  value={form.price_large}
                  onChange={(e) => setForm({ ...form, price_large: e.target.value })}
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-semibold">Deskripsi</span>
              <textarea
                className={`${inputCls} min-h-[80px] py-2`}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-semibold">URL gambar</span>
              <input
                className={inputCls}
                placeholder="/menu/default.svg"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-semibold">Catatan stok</span>
              <input
                className={inputCls}
                value={form.stock_note}
                onChange={(e) => setForm({ ...form, stock_note: e.target.value })}
              />
            </label>

            <label className="flex min-h-[44px] items-center gap-3">
              <input
                type="checkbox"
                className="h-5 w-5 accent-matcha"
                checked={form.is_available}
                onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
              />
              <span>Tersedia</span>
            </label>
            <label className="flex min-h-[44px] items-center gap-3">
              <input
                type="checkbox"
                className="h-5 w-5 accent-matcha"
                checked={form.is_best_seller}
                onChange={(e) => setForm({ ...form, is_best_seller: e.target.checked })}
              />
              <span>Best Seller</span>
            </label>

            {formError && (
              <p role="alert" className="text-sm text-danger">
                {formError}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="min-h-[44px] flex-1 rounded-xl border border-line font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="min-h-[44px] flex-1 rounded-xl bg-matcha font-semibold text-space-navy disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}