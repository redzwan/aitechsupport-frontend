"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { CreditCard, PlugZap, Loader2, ShieldAlert, CheckCircle2, Circle, FlaskConical } from "lucide-react";
import { getBillplz, updateBillplz, testBillplz, type BillplzSettings } from "@/lib/billing";

export default function BillplzPage() {
  const [s, setS] = useState<BillplzSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [sandbox, setSandbox] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [xSignatureKey, setXSignatureKey] = useState("");
  const [collectionId, setCollectionId] = useState("");

  const load = async () => {
    try {
      const cfg = await getBillplz();
      setS(cfg);
      setEnabled(cfg.enabled);
      setSandbox(cfg.sandbox);
      setCollectionId(cfg.collection_id);
    } catch (e: any) {
      if (e?.response?.status === 403) setForbidden(true);
      else toast.error("Failed to load Billplz settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cfg = await updateBillplz({
        enabled,
        sandbox,
        api_key: apiKey || undefined,
        x_signature_key: xSignatureKey || undefined,
        collection_id: collectionId,
      });
      setS(cfg);
      setApiKey("");
      setXSignatureKey("");
      toast.success("Billplz settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    setTesting(true);
    try {
      await testBillplz();
      toast.success(`Connected to Billplz ${sandbox ? "sandbox" : "production"} ✅`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Connection test failed");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (forbidden) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
        <div className="flex items-center gap-2 font-medium">
          <ShieldAlert size={18} /> Platform admin only
        </div>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
          <CreditCard size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Billplz payments</h1>
          <p className="text-sm text-slate-500">
            Connect your Billplz account to collect payments for paid plans (FPX / cards). Sandbox mode
            uses Billplz&rsquo;s test environment so you can trial checkout without real money.
          </p>
        </div>
      </div>

      <form onSubmit={save} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4" />
          Billing enabled (allow customers to pay for paid plans)
        </label>

        <label className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          <input type="checkbox" checked={sandbox} onChange={(e) => setSandbox(e.target.checked)} className="h-4 w-4" />
          <FlaskConical size={15} />
          Sandbox mode (test environment — no real charges)
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <label className="text-sm font-medium">Secret API key</label>
              {s?.api_key_set ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 size={12} /> set {s.api_key_hint}</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Circle size={12} /> not set</span>
              )}
            </div>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className={inputCls} placeholder={s?.api_key_set ? "•••••• (unchanged)" : "Billplz secret key"} autoComplete="new-password" />
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <label className="text-sm font-medium">X-Signature key</label>
              {s?.x_signature_key_set ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 size={12} /> set {s.x_signature_key_hint}</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Circle size={12} /> not set</span>
              )}
            </div>
            <input type="password" value={xSignatureKey} onChange={(e) => setXSignatureKey(e.target.value)} className={inputCls} placeholder={s?.x_signature_key_set ? "•••••• (unchanged)" : "webhook signature key"} autoComplete="new-password" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Collection ID</label>
          <input value={collectionId} onChange={(e) => setCollectionId(e.target.value)} className={inputCls} placeholder="e.g. inbmmepb" autoComplete="off" />
          <p className="mt-1 text-xs text-slate-400">
            Create a billing collection in your Billplz dashboard, then paste its ID here. Sandbox and
            production each have their own keys and collections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
            {saving ? "Saving…" : "Save Billplz settings"}
          </button>
          <button type="button" onClick={test} disabled={testing} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800">
            <PlugZap size={15} /> {testing ? "Testing…" : "Test connection"}
          </button>
        </div>
      </form>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
        <p className="font-medium text-slate-600 dark:text-slate-300">Setup checklist</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4">
          <li>Sign in to Billplz (use billplz-sandbox.com while testing) and copy your <strong>Secret Key</strong> from Settings.</li>
          <li>Create a <strong>Collection</strong> for AiTechSupport and paste its ID above.</li>
          <li>Copy the <strong>X-Signature Key</strong> so payment callbacks can be verified.</li>
          <li>Keep <strong>Sandbox mode</strong> on until you&rsquo;ve tested checkout, then switch it off and re-enter your production keys.</li>
        </ol>
      </div>
    </div>
  );
}
