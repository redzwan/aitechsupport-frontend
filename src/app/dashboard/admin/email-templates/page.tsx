"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FileText, Loader2, ShieldAlert, ChevronRight, Eye } from "lucide-react";
import { listTemplates, updateTemplate, previewTemplate, type EmailTemplate } from "@/lib/email";

const VARS: Record<string, string[]> = {
  welcome: ["{name}", "{email}", "{dashboard_url}"],
  password_changed: ["{name}", "{email}"],
  quota_warning: ["{name}", "{plan}", "{used_pct}", "{tokens_remaining}", "{dashboard_url}"],
};

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selected, setSelected] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [saving, setSaving] = useState(false);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // Server-rendered preview (content wrapped in the branded shell, sample values filled).
  const [preview, setPreview] = useState<{ subject: string; html: string }>({ subject: "", html: "" });

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const p = await previewTemplate(subject, body);
        if (!cancelled) setPreview(p);
      } catch {
        /* keep last good preview */
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [subject, body]);

  useEffect(() => {
    listTemplates()
      .then((t) => {
        setTemplates(t);
        if (t.length) pick(t[0]);
      })
      .catch((e: any) => {
        if (e?.response?.status === 403) setForbidden(true);
        else toast.error("Failed to load templates");
      })
      .finally(() => setLoading(false));
  }, []);

  const pick = (t: EmailTemplate) => {
    setSelected(t);
    setSubject(t.subject);
    setBody(t.body_html);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await updateTemplate(selected.key, { subject, body_html: body });
      setTemplates((prev) => prev.map((t) => (t.key === updated.key ? updated : t)));
      setSelected(updated);
      toast.success("Template saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
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
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
          <FileText size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Email templates</h1>
          <p className="text-sm text-slate-500">Edit the transactional emails your customers receive.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="space-y-1">
          {templates.map((t) => (
            <button
              key={t.key}
              onClick={() => pick(t)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                selected?.key === t.key ? "bg-indigo-600 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {t.name}
              <ChevronRight size={14} className="opacity-60" />
            </button>
          ))}
        </div>

        {selected && (
          <form onSubmit={save} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-slate-500">Variables:</span>
              {(VARS[selected.key] || []).map((v) => (
                <code key={v} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {v}
                </code>
              ))}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Subject</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Body (HTML)</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} className={`${inputCls} font-mono text-xs`} />
            </div>

            <div>
              <div className="mb-1 flex items-center gap-1.5 text-sm font-medium">
                <Eye size={15} className="text-slate-400" />
                Preview
                <span className="text-xs font-normal text-slate-400">(full branded email · sample values)</span>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                  <div className="text-xs text-slate-400">Subject</div>
                  <div className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                    {preview.subject || <span className="text-slate-400">No subject</span>}
                  </div>
                </div>
                <iframe
                  title="Email preview"
                  sandbox=""
                  srcDoc={preview.html}
                  className="h-96 w-full border-0 bg-white"
                />
              </div>
            </div>

            <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
              {saving ? "Saving…" : "Save template"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
