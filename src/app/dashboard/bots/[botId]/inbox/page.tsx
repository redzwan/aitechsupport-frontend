"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft, BookOpen, MessageSquare, Inbox as InboxIcon, BarChart3, Loader2, Mail, User as UserIcon, CheckCircle2, Hand, LogOut, Send, ImagePlus, X } from "lucide-react";
import {
  listConversations,
  getConversationMessages,
  updateConversationStatus,
  claimConversation,
  replyToConversation,
  uploadConversationImage,
  releaseConversation,
  type Conversation,
  type ConversationMessage,
} from "@/lib/inbox";
import { getBot, type Bot } from "@/lib/bots";
import { API_URL, TOKEN_KEY } from "@/lib/api";

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    needs_human: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    human: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    bot: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[status] || map.bot}`}>{status.replace("_", " ")}</span>;
}

export default function InboxPage() {
  const botId = Number(useParams().botId);

  const [bot, setBot] = useState<Bot | undefined>();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"needs_human" | "all">("needs_human");
  const [selected, setSelected] = useState<Conversation | undefined>();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const selectedId = selected?.id;

  const refresh = useCallback(async () => {
    setConvs(await listConversations(botId, filter === "all" ? undefined : "needs_human"));
  }, [botId, filter]);

  const loadThread = useCallback(async (convId: number) => {
    setMessages(await getConversationMessages(botId, convId));
  }, [botId]);

  // Latest callbacks/state for the SSE handler, without reconnecting the stream.
  const refreshRef = useRef(refresh);
  const loadThreadRef = useRef(loadThread);
  const selectedIdRef = useRef(selectedId);
  refreshRef.current = refresh;
  loadThreadRef.current = loadThread;
  selectedIdRef.current = selectedId;

  useEffect(() => {
    getBot(botId).then(setBot).catch(() => {});
  }, [botId]);

  useEffect(() => {
    setLoading(true);
    refresh().catch(() => toast.error("Failed to load conversations")).finally(() => setLoading(false));
  }, [refresh]);

  // Poll the queue (10s) and the open thread (4s); pause when the tab is hidden.
  useEffect(() => {
    const q = setInterval(() => { if (!document.hidden) refresh().catch(() => {}); }, 10000);
    return () => clearInterval(q);
  }, [refresh]);

  useEffect(() => {
    if (!selectedId) return;
    const t = setInterval(() => { if (!document.hidden) loadThread(selectedId).catch(() => {}); }, 4000);
    return () => clearInterval(t);
  }, [selectedId, loadThread]);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages]);

  // Live SSE: refetch instantly on any org change. Polling above stays as the fallback.
  useEffect(() => {
    const ctrl = new AbortController();
    let retry: ReturnType<typeof setTimeout> | undefined;
    const connect = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/bots/${botId}/events`, {
          headers: { Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) ?? "" : ""}` },
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) throw new Error("sse");
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n\n")) >= 0) {
            const frame = buf.slice(0, nl);
            buf = buf.slice(nl + 2);
            const line = frame.split("\n").find((l) => l.startsWith("data:"));
            if (!line) continue;
            let ev: { type?: string; conv_id?: number };
            try {
              ev = JSON.parse(line.slice(5).trim());
            } catch {
              continue;
            }
            if (ev.type === "ping") {
              refreshRef.current().catch(() => {});
              if (ev.conv_id && ev.conv_id === selectedIdRef.current) {
                loadThreadRef.current(ev.conv_id).catch(() => {});
              }
            }
          }
        }
      } catch {
        /* dropped */
      }
      if (!ctrl.signal.aborted) retry = setTimeout(connect, 5000); // reconnect
    };
    connect();
    return () => {
      ctrl.abort();
      if (retry) clearTimeout(retry);
    };
  }, [botId]);

  const open = async (c: Conversation) => {
    setSelected(c);
    setMessages([]);
    try {
      await loadThread(c.id);
    } catch {
      toast.error("Failed to load thread");
    }
  };

  const claim = async (c: Conversation) => {
    try {
      const updated = await claimConversation(botId, c.id);
      setSelected(updated);
      toast.success("Claimed — you're now handling this");
      await refresh();
    } catch (err: any) {
      if (err?.response?.status === 409) toast.error("Another agent already claimed it");
      else toast.error("Failed to claim");
      await refresh();
    }
  };

  const pickImage = (f: File | null) => {
    if (!f) return;
    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(f.type)) {
      toast.error("Only PNG, JPEG, WebP or GIF images are supported");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("That image is too large — the limit is 5MB");
      return;
    }
    setAttachment(f);
  };

  const send = async () => {
    // An image on its own is a valid reply, so text isn't required when one is staged.
    if (!selected || (!reply.trim() && !attachment) || sending) return;
    setSending(true);
    const text = reply.trim();
    setReply("");
    try {
      let imageKey: string | undefined;
      if (attachment) {
        imageKey = (await uploadConversationImage(botId, selected.id, attachment)).image_key;
        setAttachment(null);
      }
      const msg = await replyToConversation(botId, selected.id, text, imageKey);
      setMessages((prev) => [...prev, msg]);
      setSelected((s) => (s ? { ...s, status: "human", assigned_user_id: msg.sender_user_id } : s));
      refresh().catch(() => {});
    } catch (err: any) {
      setReply(text);
      const detail = err?.response?.data?.detail;
      if (err?.response?.status === 403) toast.error("This conversation is handled by another agent");
      else if (err?.response?.status === 413) toast.error("That image is too large — the limit is 5MB");
      else if (err?.response?.status === 415) toast.error("That file type isn't supported");
      else toast.error(typeof detail === "string" ? detail : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const setStatus = async (c: Conversation, status: string, label: string) => {
    try {
      const updated = await updateConversationStatus(botId, c.id, status);
      setSelected(updated);
      toast.success(label);
      await refresh();
    } catch {
      toast.error("Failed to update");
    }
  };

  const release = async (c: Conversation) => {
    try {
      const updated = await releaseConversation(botId, c.id);
      setSelected(updated);
      toast.success("Released back to the queue");
      await refresh();
    } catch {
      toast.error("Failed to release");
    }
  };

  const title = (c: Conversation) => c.contact_name || c.contact_email || "Anonymous visitor";
  const canReply = selected && (selected.status === "human" || selected.status === "needs_human");

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard/bots" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={14} /> Bots
      </Link>

      <div className="mb-5 flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        <Link href={`/dashboard/bots/${botId}/knowledge`} className="flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-500"><BookOpen size={15} /> Knowledge</Link>
        <Link href={`/dashboard/bots/${botId}/widget`} className="flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-500"><MessageSquare size={15} /> Website widget</Link>
        <span className="flex flex-1 items-center justify-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 shadow-sm dark:bg-slate-900"><InboxIcon size={15} /> Inbox</span>
        <Link href={`/dashboard/bots/${botId}/analytics`} className="flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-500"><BarChart3 size={15} /> Analytics</Link>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inbox</h1>
          <p className="mt-1 text-sm text-slate-500">{bot ? bot.name : `Bot #${botId}`} — claim a lead and chat live.</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-sm dark:bg-slate-800">
          {(["needs_human", "all"] as const).map((f) => (
            <button key={f} onClick={() => { setFilter(f); setSelected(undefined); }} className={`rounded-md px-3 py-1 font-medium ${filter === f ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900" : "text-slate-500"}`}>
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
                {filter === "needs_human" ? "No leads yet — visitors who ask for a human appear here." : "No conversations yet."}
              </div>
            ) : (
              convs.map((c) => (
                <button key={c.id} onClick={() => open(c)} className={`w-full rounded-xl border px-4 py-3 text-left transition ${selectedId === c.id ? "border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30" : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"}`}>
                  <div className="flex items-center justify-between">
                    <span className="truncate font-medium">{title(c)}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    {c.contact_email && <span className="inline-flex items-center gap-1"><Mail size={11} /> {c.contact_email}</span>}
                    <span>· {c.message_count} msg · {timeAgo(c.last_message_at)}</span>
                    {c.assignee_name && <span className="text-indigo-500">· {c.assignee_name}</span>}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* thread */}
          <div className="md:sticky md:top-6 md:self-start">
            {!selected ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400 dark:border-slate-700">Select a conversation.</div>
            ) : (
              <div className="flex h-[520px] flex-col rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 p-3 dark:border-slate-800">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium"><UserIcon size={14} /> {title(selected)}</div>
                    {selected.assignee_name ? <div className="text-xs text-indigo-500">Claimed by {selected.assignee_name}</div> : selected.contact_email && <a href={`mailto:${selected.contact_email}`} className="text-xs text-slate-500 hover:underline">{selected.contact_email}</a>}
                  </div>
                  <div className="flex items-center gap-2">
                    {selected.status === "needs_human" && !selected.assigned_user_id && (
                      <button onClick={() => claim(selected)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700"><Hand size={13} /> Claim</button>
                    )}
                    {selected.status === "human" && (
                      <button onClick={() => release(selected)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" title="Return to queue"><LogOut size={13} /> Release</button>
                    )}
                    {selected.status !== "resolved" && (
                      <button onClick={() => setStatus(selected, "resolved", "Resolved")} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><CheckCircle2 size={13} /> Resolve</button>
                    )}
                  </div>
                </div>

                <div ref={threadRef} className="flex-1 space-y-2 overflow-y-auto p-4">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === "agent" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${m.role === "agent" ? "bg-indigo-600 text-white" : m.role === "assistant" ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" : "border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"}`}>
                        {m.role === "assistant" && <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">bot</div>}
                        {m.image_url && (
                          <a href={m.image_url} target="_blank" rel="noopener noreferrer" className="mb-1 block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={m.image_url}
                              alt="Attachment"
                              className="max-h-56 max-w-full rounded-lg border border-black/10"
                              onError={(e) => {
                                // Expired by the 90-day rule — show a caption, not a broken icon.
                                const el = e.currentTarget;
                                el.replaceWith(
                                  Object.assign(document.createElement("div"), {
                                    className: "text-xs italic opacity-70",
                                    textContent: "Image unavailable",
                                  })
                                );
                              }}
                            />
                          </a>
                        )}
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && <div className="pt-8 text-center text-sm text-slate-400">No messages yet.</div>}
                </div>

                {canReply ? (
                  <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="border-t border-slate-100 p-3 dark:border-slate-800">
                    {attachment && (
                      <div className="mb-2 flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 dark:border-slate-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(attachment)} alt="" className="h-9 w-9 rounded object-cover" />
                        <span className="min-w-0 flex-1 truncate text-xs text-slate-500">{attachment.name}</span>
                        <button type="button" onClick={() => setAttachment(null)} aria-label="Remove image" className="text-slate-400 hover:text-slate-600">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => { pickImage(e.target.files?.[0] ?? null); e.target.value = ""; }}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={sending}
                      title="Attach an image"
                      aria-label="Attach an image"
                      className="rounded-lg border border-slate-300 px-2.5 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50 dark:border-slate-700"
                    >
                      <ImagePlus size={16} />
                    </button>
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
                      rows={1}
                      placeholder={selected.status === "needs_human" ? "Reply to take over…" : "Type a reply…"}
                      className="max-h-24 flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800"
                    />
                    <button type="submit" disabled={sending || (!reply.trim() && !attachment)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"><Send size={15} /></button>
                    </div>
                  </form>
                ) : (
                  <div className="border-t border-slate-100 p-3 text-center text-xs text-slate-400 dark:border-slate-800">
                    {selected.status === "resolved" ? "This conversation is resolved." : "Handled by the bot."}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
