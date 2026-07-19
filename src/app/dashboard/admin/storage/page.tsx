"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { HardDrive, PlugZap, Loader2, ShieldAlert, CheckCircle2, Circle } from "lucide-react";
import { getStorage, updateStorage, testStorage, type StorageSettings } from "@/lib/storage";

export default function StoragePage() {
  const [s, setS] = useState<StorageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [endpoint, setEndpoint] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [bucket, setBucket] = useState("");
  const [secure, setSecure] = useState(true);
  const [enabled, setEnabled] = useState(false);

  const load = async () => {
    try {
      const cfg = await getStorage();
      setS(cfg);
      setEndpoint(cfg.endpoint);
      setAccessKey(cfg.access_key);
      setBucket(cfg.bucket);
      setSecure(cfg.secure);
      setEnabled(cfg.enabled);
    } catch (e: any) {
      if (e?.response?.status === 403) setForbidden(true);
      else toast.error("Failed to load storage settings");
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
      const cfg = await updateStorage({
        endpoint,
        access_key: accessKey,
        secret_key: secretKey || undefined,
        bucket,
        secure,
        enabled,
      });
      setS(cfg);
      setSecretKey("");
      toast.success("Storage settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    setTesting(true);
    try {
      await testStorage();
      toast.success("Connected — bucket is reachable ✅");
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
          <HardDrive size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Object storage</h1>
          <p className="text-sm text-slate-500">
            AIStor / MinIO bucket for original knowledge-base uploads. Files are stored privately and
            served via short-lived links.
          </p>
        </div>
      </div>

      <form onSubmit={save} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4" />
          Storage enabled (persist uploaded files)
        </label>

        <div>
          <label className="mb-1 block text-sm font-medium">Endpoint</label>
          <input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} className={inputCls} placeholder="s3.dev-stage.net" />
          <p className="mt-1 text-xs text-slate-400">Host only — no https:// prefix. TLS is controlled by the switch below.</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Bucket</label>
          <input value={bucket} onChange={(e) => setBucket(e.target.value)} className={inputCls} placeholder="aitechsupport-kb" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Access key</label>
            <input value={accessKey} onChange={(e) => setAccessKey(e.target.value)} className={inputCls} autoComplete="off" />
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <label className="text-sm font-medium">Secret key</label>
              {s?.secret_key_set ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 size={12} /> set {s.secret_key_hint}</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Circle size={12} /> not set</span>
              )}
            </div>
            <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className={inputCls} placeholder={s?.secret_key_set ? "•••••• (unchanged)" : "secret key"} autoComplete="new-password" />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={secure} onChange={(e) => setSecure(e.target.checked)} className="h-4 w-4" />
          Use TLS (https)
        </label>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
            {saving ? "Saving…" : "Save storage settings"}
          </button>
          <button type="button" onClick={test} disabled={testing} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800">
            <PlugZap size={15} /> {testing ? "Testing…" : "Test connection"}
          </button>
        </div>
      </form>

      <p className="mt-4 text-xs text-slate-400">
        Create the bucket on your AIStor console first, then enter its credentials here. The test checks that the
        bucket is reachable — it does not create it.
      </p>
    </div>
  );
}
