"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { ArrowLeft, Loader2, Plus, Trash2, ExternalLink } from "lucide-react";
import { listPages, createPage, updatePage, deletePage, type AdminPage } from "@/lib/cms";

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800";

type Draft = { id?: number; slug: string; title: string; body: string; meta_description: string; is_published: boolean; sort_order: number };

const empty: Draft = { slug: "", title: "", body: "", meta_description: "", is_published: true, sort_order: 0 };

export default function PagesManager() {
  const [pages, setPages] = useState<AdminPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = async () => setPages(await listPages());

  useEffect(() => {
    refresh()
      .catch((err) => {
        if (err?.response?.status === 403) setForbidden(true);
        else toast.error("Failed to load");
      })
      .finally(() => setLoading(false));
  }, []);

  const edit = (p: AdminPage) =>
    setDraft({ id: p.id, slug: p.slug, title: p.title, body: p.body ?? "", meta_description: p.meta_description ?? "", is_published: p.is_published, sort_order: p.sort_order });

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      if (draft.id) {
        await updatePage(draft.id, { title: draft.title, body: draft.body, meta_description: draft.meta_description, is_published: draft.is_published, sort_order: draft.sort_order });
      } else {
        const created = await createPage(draft);
        setDraft({ ...draft, id: created.id, slug: created.slug });
      }
      await refresh();
      toast.success("Saved");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: AdminPage) => {
    if (!confirm(`Delete “${p.title}”?`)) return;
    try {
      await deletePage(p.id);
      if (draft?.id === p.id) setDraft(null);
      await refresh();
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-slate-500"><Loader2 className="animate-spin" /></div>;
  if (forbidden) return <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40">Platform admin only.</div>;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/dashboard/admin" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft size={14} /> Admin</Link>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pages</h1>
          <p className="mt-1 text-sm text-slate-500">Content pages (About, Privacy, Terms…) shown at /slug.</p>
        </div>
        <button onClick={() => setDraft({ ...empty })} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"><Plus size={16} /> New page</button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-2">
          {pages.map((p) => (
            <button key={p.id} onClick={() => edit(p)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${draft?.id === p.id ? "border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30" : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"}`}>
              <div className="min-w-0">
                <div className="truncate font-medium">{p.title}</div>
                <div className="text-xs text-slate-500">/{p.slug}</div>
              </div>
              <div className="flex items-center gap-2">
                {!p.is_published && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800">draft</span>}
                <span onClick={(e) => { e.stopPropagation(); remove(p); }} className="text-slate-400 hover:text-rose-600"><Trash2 size={15} /></span>
              </div>
            </button>
          ))}
          {pages.length === 0 && <p className="text-sm text-slate-400">No pages yet.</p>}
        </div>

        <div className="md:col-span-2">
          {!draft ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400 dark:border-slate-700">Select a page or create one.</div>
          ) : (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Page title" className={`${inputCls} text-base font-medium`} />
              {!draft.id && <input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="slug (e.g. about)" className={inputCls} />}
              {draft.id && <div className="flex items-center gap-2 text-xs text-slate-500">/{draft.slug} <Link href={`/${draft.slug}`} target="_blank" className="inline-flex items-center gap-0.5 text-indigo-600 hover:underline">view <ExternalLink size={11} /></Link></div>}
              <input value={draft.meta_description} onChange={(e) => setDraft({ ...draft, meta_description: e.target.value })} placeholder="Meta description (SEO)" className={inputCls} />
              <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={10} placeholder="<p>HTML content…</p>" className={`${inputCls} font-mono text-xs`} />
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-2 text-xs font-medium text-slate-400">Preview</div>
                <div className="text-sm text-slate-600 dark:text-slate-300 [&_a]:text-indigo-600 [&_a]:underline [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:font-semibold [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: draft.body }} />
              </div>
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.is_published} onChange={(e) => setDraft({ ...draft, is_published: e.target.checked })} className="h-4 w-4 accent-indigo-600" /> Published</label>
                <button onClick={save} disabled={saving || !draft.title.trim() || (!draft.id && !draft.slug.trim())} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">{saving ? "Saving…" : "Save"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
