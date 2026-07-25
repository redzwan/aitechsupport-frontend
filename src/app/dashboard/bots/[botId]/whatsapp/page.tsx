"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  BookOpen,
  MessageSquare,
  Phone,
  Inbox as InboxIcon,
  BarChart3,
  Loader2,
  CheckCircle2,
  QrCode,
  Lock,
} from "lucide-react";
import {
  getWhatsApp,
  connectWhatsApp,
  getWhatsAppStatus,
  disconnectWhatsApp,
  type WhatsAppStatus,
} from "@/lib/whatsapp";
import { getBot, type Bot } from "@/lib/bots";

const POLL_MS = 3000;

export default function WhatsAppPage() {
  const botId = Number(useParams().botId);

  const [bot, setBot] = useState<Bot | undefined>();
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = () => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const s = await getWhatsAppStatus(botId);
        setStatus(s);
        if (s.connection_status === "connected") {
          stopPolling();
          setQr(null);
          toast.success("WhatsApp connected");
        }
      } catch {
        // transient — next tick retries
      }
    }, POLL_MS);
  };

  const connect = async () => {
    setConnecting(true);
    try {
      const res = await connectWhatsApp(botId);
      setStatus((prev) => (prev ? { ...prev, connection_status: res.connection_status } : prev));
      if (res.connection_status === "connected") {
        setQr(null);
        toast.success("WhatsApp connected");
      } else {
        setQr(res.qr_base64);
        startPolling();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to start WhatsApp connection");
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    getBot(botId).then(setBot).catch(() => {});
    getWhatsApp(botId)
      .then(async (s) => {
        setStatus(s);
        // A channel can already be mid-connect from a previous visit (page
        // refresh, tab closed, etc) — we never actually have the QR image
        // itself (only status is persisted), so fetch a fresh one rather
        // than showing a spinner with nothing behind it.
        if (s.connection_status === "pending_qr") {
          await connect();
        }
      })
      .catch(() => toast.error("Failed to load WhatsApp status"))
      .finally(() => setLoading(false));
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botId]);

  const disconnect = async () => {
    if (!confirm("Disconnect this WhatsApp number? The bot will stop answering on WhatsApp until reconnected.")) return;
    setDisconnecting(true);
    try {
      stopPolling();
      setQr(null);
      setStatus(await disconnectWhatsApp(botId));
      toast.success("Disconnected");
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const connected = status?.connection_status === "connected";
  const pending = status?.connection_status === "pending_qr";

  return (
    <div className="mx-auto max-w-2xl">
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
          <Phone size={15} /> WhatsApp
        </span>
        <Link href={`/dashboard/bots/${botId}/inbox`} className="flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-500">
          <InboxIcon size={15} /> Inbox
        </Link>
        <Link href={`/dashboard/bots/${botId}/analytics`} className="flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-500">
          <BarChart3 size={15} /> Analytics
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">WhatsApp</h1>
        <p className="mt-1 text-sm text-slate-500">
          {bot ? bot.name : `Bot #${botId}`} — connect a dedicated WhatsApp number for this bot to answer on.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        {status && !status.plan_allows_whatsapp ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950">
              <Lock size={22} />
            </div>
            <div>
              <div className="font-medium">Not available on your current plan</div>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                WhatsApp isn&apos;t included on the Free plan. Upgrade to connect a dedicated number for this bot.
              </p>
            </div>
            <Link
              href="/dashboard/billing"
              className="mt-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              View plans
            </Link>
          </div>
        ) : connected ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="font-medium">WhatsApp connected</div>
              <p className="mt-1 text-sm text-slate-500">This bot is answering messages sent to the linked number.</p>
            </div>
            <button
              onClick={disconnect}
              disabled={disconnecting}
              className="mt-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {disconnecting ? "Disconnecting…" : "Disconnect"}
            </button>
          </div>
        ) : qr || pending ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`data:image/png;base64,${qr}`} alt="WhatsApp QR code" className="h-56 w-56 rounded-lg border border-slate-200 dark:border-slate-700" />
            ) : (
              <div className="flex h-56 w-56 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 dark:border-slate-700">
                <Loader2 className="animate-spin" />
              </div>
            )}
            <p className="max-w-sm text-sm text-slate-500">
              Open WhatsApp on the phone you want this bot to use → <strong>Linked devices</strong> → <strong>Link a device</strong>, and scan this code.
            </p>
            <p className="text-xs text-slate-400">Waiting for scan…</p>
            <button onClick={connect} disabled={connecting} className="text-xs font-medium text-indigo-600 hover:underline disabled:opacity-60">
              {connecting ? "Refreshing…" : "Refresh QR code"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
              <QrCode size={22} />
            </div>
            <div>
              <div className="font-medium">Not connected</div>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Connect a dedicated WhatsApp number so this bot can answer your customers directly on WhatsApp.
              </p>
            </div>
            <button
              onClick={connect}
              disabled={connecting}
              className="mt-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {connecting ? "Starting…" : "Connect WhatsApp"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
