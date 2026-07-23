"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Bot as BotIcon, Plus, Loader2, BookOpen, MessageSquare, Inbox as InboxIcon, BarChart3, Pencil, LifeBuoy } from "lucide-react";
import HandoffSettings from "@/components/bot/HandoffSettings";
import { listBots, createBot, updateBot, type Bot } from "@/lib/bots";

/** Always a string: FastAPI returns `detail` as a list for validation errors,
 *  and handing that to toast/JSX would crash React. */
function errMsg(e: any, fallback: string): string {
  const d = e?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x?.msg).filter(Boolean).join("; ") || fallback;
  return fallback;
}

export default function BotsPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  // Inline rename
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  // Which bot's handoff panel is expanded (one at a time keeps the list scannable).
  const [handoffFor, setHandoffFor] = useState<number | null>(null);

  const startEdit = (b: Bot) => {
    setEditingId(b.id);
    setDraftName(b.name);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraftName("");
  };

  // Enter blurs the input, so this is the single save path (Escape clears the
  // draft first, which makes the resulting blur a no-op).
  const saveName = async (b: Bot) => {
    if (savingId === b.id) return;
    const next = draftName.trim();
    if (!next || next === b.name) {
      cancelEdit();
      return;
    }
    setSavingId(b.id);
    try {
      const updated = await updateBot(b.id, { name: next });
      setBots((prev) => prev.map((x) => (x.id === b.id ? updated : x)));
      cancelEdit();
      toast.success("Bot renamed");
    } catch (err: any) {
      toast.error(errMsg(err, "Failed to rename bot"));
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    listBots()
      .then(setBots)
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const bot = await createBot({
        name,
        system_prompt: systemPrompt || undefined,
      });
      setBots((prev) => [...prev, bot]);
      setName("");
      setSystemPrompt("");
      setShowForm(false);
      toast.success("Bot created");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create bot");
    } finally {
      setCreating(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800";

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bots</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} /> New bot
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Acme Helpdesk" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">System prompt</label>
            <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={3} className={inputCls} placeholder="You are Acme's friendly support agent…" />
          </div>
          <p className="text-xs text-slate-500">
            The AI model is set by your plan — see Billing to check or upgrade it.
          </p>
          <button type="submit" disabled={creating} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
            {creating ? "Creating…" : "Create bot"}
          </button>
        </form>
      )}

      {bots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
          <BotIcon className="mx-auto mb-2 opacity-40" />
          No bots yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-3">
          {bots.map((b) => (
            <div key={b.id} className="rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
                  <BotIcon size={18} />
                </div>
                <div>
                  {editingId === b.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        autoFocus
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        onBlur={() => saveName(b)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.currentTarget.blur();
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            cancelEdit();
                          }
                        }}
                        disabled={savingId === b.id}
                        aria-label="Bot name"
                        className="w-52 rounded-md border border-indigo-500 bg-transparent px-2 py-0.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60"
                      />
                      {savingId === b.id && <Loader2 size={14} className="animate-spin text-slate-400" />}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(b)}
                      title="Rename bot"
                      className="group inline-flex items-center gap-1.5 font-medium hover:text-indigo-600"
                    >
                      {b.name}
                      <Pencil size={12} className="opacity-0 transition group-hover:opacity-60" />
                    </button>
                  )}
                  <div className="text-xs text-slate-500">Model: {b.effective_chat_model}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/dashboard/bots/${b.id}/knowledge`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <BookOpen size={14} /> Knowledge
                </Link>
                <Link
                  href={`/dashboard/bots/${b.id}/widget`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <MessageSquare size={14} /> Widget
                </Link>
                <Link
                  href={`/dashboard/bots/${b.id}/inbox`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <InboxIcon size={14} /> Inbox
                </Link>
                <button
                  type="button"
                  onClick={() => setHandoffFor((id) => (id === b.id ? null : b.id))}
                  aria-expanded={handoffFor === b.id}
                  className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                    handoffFor === b.id
                      ? "border-indigo-500 text-indigo-600 dark:border-indigo-500"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <LifeBuoy size={14} /> Handoff
                </button>
                <Link
                  href={`/dashboard/bots/${b.id}/analytics`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <BarChart3 size={14} /> Analytics
                </Link>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${b.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-500"}`}>
                  {b.is_active ? "active" : "inactive"}
                </span>
              </div>
              </div>
              {handoffFor === b.id && (
                <HandoffSettings
                  bot={b}
                  onSaved={(u) => setBots((prev) => prev.map((x) => (x.id === u.id ? u : x)))}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
