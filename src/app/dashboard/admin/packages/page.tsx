"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Boxes, Plus, Pencil, Trash2, Loader2, ShieldAlert } from "lucide-react";
import {
  adminListPackages,
  adminCreatePackage,
  adminUpdatePackage,
  adminDeletePackage,
  type Package,
  type PackageUpsert,
} from "@/lib/billing";
import { listModels, type ModelOption } from "@/lib/bots";

const empty: PackageUpsert = {
  slug: "",
  name: "",
  price_myr: 0,
  monthly_token_quota: 100000,
  max_bots: 1,
  features: [],
  is_active: true,
  sort_order: 0,
  model_provider: "openrouter",
  chat_model: "",
  self_hosted_base_url: "",
};

const CUSTOM_MODEL = "__custom__";

export default function AdminPackagesPage() {
  const [pkgs, setPkgs] = useState<Package[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [form, setForm] = useState<PackageUpsert | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [packages, catalog] = await Promise.all([adminListPackages(), listModels()]);
      setPkgs(packages);
      setModels(catalog);
    } catch (err: any) {
      if (err?.response?.status === 403) setForbidden(true);
      else toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  // OpenRouter picks from the catalog; local Ollama tags are always custom, since
  // they're whatever the admin's self-hosted server happens to serve.
  const openRouterModels = models.filter((m) => m.provider !== "Local (Ollama)");

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty });
  };
  const openEdit = (p: Package) => {
    setEditing(p);
    const { id, ...rest } = p;
    setForm({ ...rest });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      if (editing) await adminUpdatePackage(editing.id, form);
      else await adminCreatePackage(form);
      toast.success("Saved");
      setForm(null);
      setEditing(null);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Package) => {
    if (!confirm(`Delete package "${p.name}"?`)) return;
    try {
      await adminDeletePackage(p.id);
      setPkgs((prev) => prev.filter((x) => x.id !== p.id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800";

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (forbidden)
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
        <div className="flex items-center gap-2 font-medium">
          <ShieldAlert size={18} /> Platform admin only
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
            <Boxes size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Packages</h1>
            <p className="text-sm text-slate-500">The plans you sell to clients.</p>
          </div>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus size={16} /> New package
        </button>
      </div>

      {form && (
        <form onSubmit={save} className="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-sm font-semibold">{editing ? `Edit ${editing.name}` : "New package"}</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Slug</label>
              <input required disabled={!!editing} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputCls} placeholder="starter" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Starter" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Price (RM/mo)</label>
              <input type="number" min={0} value={form.price_myr} onChange={(e) => setForm({ ...form, price_myr: Number(e.target.value) })} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Monthly token quota</label>
              <input type="number" min={0} value={form.monthly_token_quota} onChange={(e) => setForm({ ...form, monthly_token_quota: Number(e.target.value) })} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Max bots</label>
              <input type="number" min={1} value={form.max_bots} onChange={(e) => setForm({ ...form, max_bots: Number(e.target.value) })} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Sort order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Features (one per line)</label>
            <textarea rows={4} value={form.features.join("\n")} onChange={(e) => setForm({ ...form, features: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} className={inputCls} placeholder={"3 chatbots\n300k tokens / month"} />
          </div>
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <label className="mb-2 block text-xs font-medium text-slate-500">AI model for this package</label>
            <div className="mb-3 flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={form.model_provider === "self_hosted"}
                  onChange={() => setForm({ ...form, model_provider: "self_hosted" })}
                />
                Self-hosted (Ollama)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={form.model_provider === "openrouter"}
                  onChange={() => setForm({ ...form, model_provider: "openrouter" })}
                />
                OpenRouter
              </label>
            </div>

            {form.model_provider === "self_hosted" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Server URL (IP:port)</label>
                  <input
                    required
                    value={form.self_hosted_base_url || ""}
                    onChange={(e) => setForm({ ...form, self_hosted_base_url: e.target.value })}
                    className={inputCls}
                    placeholder="http://100.101.148.46:11434"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Model tag</label>
                  <input
                    required
                    value={form.chat_model || ""}
                    onChange={(e) => setForm({ ...form, chat_model: e.target.value })}
                    className={inputCls}
                    placeholder="qwen3:8b"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Model</label>
                <select
                  value={
                    openRouterModels.some((m) => m.id === form.chat_model) ? form.chat_model || "" : CUSTOM_MODEL
                  }
                  onChange={(e) => setForm({ ...form, chat_model: e.target.value === CUSTOM_MODEL ? "" : e.target.value })}
                  className={inputCls}
                >
                  {openRouterModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label} — {m.provider}
                    </option>
                  ))}
                  <option value={CUSTOM_MODEL}>Custom model id…</option>
                </select>
                {!openRouterModels.some((m) => m.id === form.chat_model) && (
                  <input
                    required
                    value={form.chat_model || ""}
                    onChange={(e) => setForm({ ...form, chat_model: e.target.value })}
                    className={`${inputCls} mt-2`}
                    placeholder="anthropic/claude-haiku-4.5"
                  />
                )}
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Active (shown to clients)
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 dark:border-slate-700">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Tokens/mo</th>
              <th className="px-4 py-3">Bots</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {pkgs.map((p) => (
              <tr key={p.id} className="bg-white dark:bg-slate-900">
                <td className="px-4 py-3">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-slate-400">{p.slug}</div>
                </td>
                <td className="px-4 py-3">{p.price_myr === 0 ? "Free" : `RM${p.price_myr}`}</td>
                <td className="px-4 py-3">{p.monthly_token_quota.toLocaleString()}</td>
                <td className="px-4 py-3">{p.max_bots}</td>
                <td className="px-4 py-3">
                  <div>{p.chat_model || "—"}</div>
                  <div className="text-xs text-slate-400">
                    {p.model_provider === "self_hosted" ? "Self-hosted" : "OpenRouter"}
                  </div>
                </td>
                <td className="px-4 py-3">{p.is_active ? "✓" : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(p)} className="text-slate-400 hover:text-indigo-600"><Pencil size={15} /></button>
                    <button onClick={() => remove(p)} className="text-slate-400 hover:text-rose-600"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
