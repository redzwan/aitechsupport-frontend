"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft, BookOpen, MessageSquare, Inbox as InboxIcon, BarChart3, Loader2, Mail, User as UserIcon, CheckCircle2 } from "lucide-react";
import {
  listConversations,
  getConversationMessages,
  updateConversationStatus,
  type Conversation,
  type ConversationMessage,
} from "@/lib/inbox";
import { getBot, type Bot } from "@/lib/bots";

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    needs_human: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    bot: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    human: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[status] || map.bot}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export default function InboxPage() {
  const botId = Number(useParams().botId);

  const [bot, setBot] = useState<Bot | undefined>();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"needs_human" | "all">("needs_human");
  const [selected, setSelected] = useState<Conversation | undefined>();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);

  const refresh = useCallback(async () => {
    const data = await listConversations(botId, filter === "all" ? undefined : "needs_human");
    setConvs(data);
  }, [botId, filter]);

  useEffect(() => {
    getBot(botId).then(setBot).catch(() => {});
  }, [botId]);

  useEffect(() => {
    setLoading(true);
    refresh()
      .catch(() => toast.error("Failed to load conversations"))
      .finally(() => setLoading(false));
  }, [refresh]);

  const open = async (c: Conversation) => {
    setSelected(c);
    setLoadingThread(true);
    try {
      setMessages(await getConversationMessages(botId, c.id));
    } catch {
      toast.error("Failed to load thread");
    } finally {
      setLoadingThread(false);
    }
  };

  const resolve = async (c: Conversation) => {
    try {
      const updated = await updateConversationStatus(botId, c.id, "resolved");
      toast.success("Marked resolved");
      setSelected(updated);
      await refresh();
    } catch {
      toast.error("Failed to update");
    }
  };

  const title = (c: Conversation) => c.contact_name || (c.contact_email ? c.contact_email : "Anonymous visitor");

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard/bots" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={14} /> Bots
      </Link>

      <div className="mb-5 flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        <Link href={`/dashboard/bots/${botId}/knowledge`} className="flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-500">
          <BookOpen size={15} /> Knowledge
        </Link>
        <Link href={`/dashboard/bots/${botId}/widget`} className="flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-500">
          <MessageSquare size={15} /> Website widget
        </Link>
        <span className="flex flex-1 items-center justify-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 shadow-sm dark:bg-slate-900">
          <InboxIcon size={15} /> Inbox
        </span>
        <Link href={`/dashboard/bots/${botId}/analytics`} className="flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-500">
          <BarChart3 size={15} /> Analytics
        </Link>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inbox</h1>
          <p className="mt-1 text-sm text-slate-500">{bot ? bot.name : `Bot #${botId}`} — visitors who asked for a human.</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-sm dark:bg-slate-800">
          {(["needs_human", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setSelected(undefined); }}
              className={`rounded-md px-3 py-1 font-medium ${filter === f ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900" : "text-slate-500"}`}
            >
              {f === "needs_human" ? "Leads" : "All"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center text-slate-500"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {/* list */}
          <div className="space-y-2">
            {convs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
                {filter === "needs_human" ? "No leads yet — visitors who ask for a human will appear here." : "No conversations yet."}
              </div>
            ) : (
              convs.map((c) => (
                <button
                  key={c.id}
                  onClick={() => open(c)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${selected?.id === c.id ? "border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30" : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate font-medium">{title(c)}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    {c.contact_email && <span className="inline-flex items-center gap-1"><Mail size={11} /> {c.contact_email}</span>}
                    <span>· {c.message_count} msg</span>
                    <span>· {timeAgo(c.last_message_at)}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* thread */}
          <div className="md:sticky md:top-6 md:self-start">
            {!selected ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400 dark:border-slate-700">
                Select a conversation to read it.
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-medium"><UserIcon size={14} /> {title(selected)}</div>
                    {selected.contact_email && <a href={`mailto:${selected.contact_email}`} className="text-xs text-indigo-600 hover:underline">{selected.contact_email}</a>}
                  </div>
                  {selected.status !== "resolved" && (
                    <button onClick={() => resolve(selected)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                      <CheckCircle2 size={13} /> Resolve
                    </button>
                  )}
                </div>
                <div className="max-h-[420px] space-y-2 overflow-y-auto p-4">
                  {loadingThread ? (
                    <div className="flex h-24 items-center justify-center text-slate-400"><Loader2 className="animate-spin" size={18} /></div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${m.role === "user" ? "bg-indigo-600 text-white" : m.role === "agent" ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100" : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"}`}>
                          {m.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
