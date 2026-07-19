"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  FileText,
  Link2,
  Type,
  Trash2,
  Loader2,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Download,
} from "lucide-react";
import {
  listKnowledge,
  addKnowledge,
  uploadKnowledge,
  deleteKnowledge,
  knowledgeDownloadUrl,
  type KnowledgeSource,
} from "@/lib/knowledge";
import { getBot, type Bot } from "@/lib/bots";

type Tab = "file" | "url" | "text";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ready: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    processing: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    pending: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    failed: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  };
  const icon =
    status === "ready" ? <CheckCircle2 size={12} /> : status === "failed" ? <XCircle size={12} /> : <Loader2 size={12} className="animate-spin" />;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${map[status] || map.pending}`}>
      {icon}
      {status}
    </span>
  );
}

export default function KnowledgePage() {
  const params = useParams();
  const botId = Number(params.botId);

  const [bot, setBot] = useState<Bot | undefined>();
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("file");
  const [busy, setBusy] = useState(false);

  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    setSources(await listKnowledge(botId));
  }, [botId]);

  useEffect(() => {
    getBot(botId).then(setBot).catch(() => {});
    refresh()
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [botId, refresh]);

  // Poll while anything is still ingesting.
  useEffect(() => {
    if (!sources.some((s) => s.status === "pending" || s.status === "processing")) return;
    const t = setInterval(() => refresh().catch(() => {}), 2000);
    return () => clearInterval(t);
  }, [sources, refresh]);

  const handleError = (err: any, fallback: string) => {
    const status = err?.response?.status;
    if (status === 503) {
      toast.error("Add your Voyage API key in Settings before uploading knowledge.");
    } else {
      toast.error(err?.response?.data?.detail || fallback);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (tab === "file") {
        const file = fileRef.current?.files?.[0];
        if (!file) {
          toast.error("Choose a file");
          return;
        }
        await uploadKnowledge(botId, file);
        if (fileRef.current) fileRef.current.value = "";
      } else if (tab === "url") {
        await addKnowledge(botId, { source_type: "url", location: url, title: title || undefined });
        setUrl("");
      } else {
        await addKnowledge(botId, { source_type: "text", text, title: title || undefined });
        setText("");
      }
      setTitle("");
      toast.success("Added — ingesting…");
      await refresh();
    } catch (err) {
      handleError(err, "Failed to add");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteKnowledge(id);
      setSources((prev) => prev.filter((s) => s.id !== id));
      toast.success("Removed");
    } catch {
      toast.error("Failed to remove");
    }
  };

  const download = async (id: number) => {
    // Open the tab synchronously (inside the click gesture) so Safari's popup
    // blocker doesn't silently drop it after the await; sever opener for
    // tab-nabbing safety. The presigned URL forces an attachment download.
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;
    try {
      const url = await knowledgeDownloadUrl(id);
      if (tab) tab.location.href = url;
      else window.location.href = url; // popup blocked -> download in the current tab
    } catch (err: any) {
      if (tab) tab.close();
      toast.error(err?.response?.data?.detail || "Download unavailable");
    }
  };

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800";
  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "file", label: "Upload file", icon: FileText },
    { key: "url", label: "From URL", icon: Link2 },
    { key: "text", label: "Paste text", icon: Type },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/bots" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={14} /> Bots
      </Link>
      <h1 className="text-2xl font-semibold">Knowledge base</h1>
      <p className="mt-1 text-sm text-slate-500">
        {bot ? bot.name : `Bot #${botId}`} — the bot answers only from what you add here.
      </p>

      <form onSubmit={submit} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                tab === key ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900" : "text-slate-500"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {tab === "file" && (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 hover:border-indigo-400 dark:border-slate-700">
            <UploadCloud className="opacity-60" />
            <span>Choose a .txt, .md, or .html file (max 5&nbsp;MB)</span>
            <input ref={fileRef} type="file" accept=".txt,.md,.markdown,.html,.htm,text/plain,text/markdown,text/html" className="text-xs" />
          </label>
        )}
        {tab === "url" && (
          <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputCls} placeholder="https://yoursite.com/faq" />
        )}
        {tab === "text" && (
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className={inputCls} placeholder="Paste FAQ / policy / product info…" />
        )}

        <div className="mt-3 flex items-center gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={`${inputCls} flex-1`} placeholder="Title (optional)" />
          <button type="submit" disabled={busy} className="whitespace-nowrap rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
            {busy ? "Adding…" : "Add"}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-500">Sources ({sources.length})</h2>
        {sources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
            No knowledge yet. Add a file, URL, or text above.
          </div>
        ) : (
          <div className="space-y-2">
            {sources.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="min-w-0">
                  <div className="truncate font-medium">{s.title || s.location || `${s.source_type} source`}</div>
                  <div className="text-xs text-slate-500">
                    {s.source_type} · {s.chunk_count} chunk{s.chunk_count === 1 ? "" : "s"}
                    {s.has_file && s.file_size != null ? ` · ${formatBytes(s.file_size)}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={s.status} />
                  {s.has_file && (
                    <button onClick={() => download(s.id)} className="text-slate-400 hover:text-indigo-600" title="Download original">
                      <Download size={16} />
                    </button>
                  )}
                  <button onClick={() => remove(s.id)} className="text-slate-400 hover:text-rose-600" title="Remove">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
