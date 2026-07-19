"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft, BookOpen, MessageSquare, Inbox as InboxIcon, BarChart3, Loader2, HelpCircle } from "lucide-react";
import { getWidgetAnalytics, type WidgetAnalytics, type AnalyticsPoint } from "@/lib/analytics";
import { getBot, type Bot } from "@/lib/bots";

function fillSeries(series: AnalyticsPoint[], days: number): AnalyticsPoint[] {
  const map = new Map(series.map((p) => [p.date, p.count]));
  const out: AnalyticsPoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: map.get(key) || 0 });
  }
  return out;
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

export default function AnalyticsPage() {
  const botId = Number(useParams().botId);

  const [bot, setBot] = useState<Bot | undefined>();
  const [data, setData] = useState<WidgetAnalytics | undefined>();
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setData(await getWidgetAnalytics(botId, days));
  }, [botId, days]);

  useEffect(() => {
    getBot(botId).then(setBot).catch(() => {});
  }, [botId]);

  useEffect(() => {
    setLoading(true);
    refresh()
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [refresh]);

  const series = data ? fillSeries(data.series, data.days) : [];
  const maxCount = Math.max(1, ...series.map((p) => p.count));
  const nf = (n: number) => new Intl.NumberFormat().format(n);

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
        <Link href={`/dashboard/bots/${botId}/inbox`} className="flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-500">
          <InboxIcon size={15} /> Inbox
        </Link>
        <span className="flex flex-1 items-center justify-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 shadow-sm dark:bg-slate-900">
          <BarChart3 size={15} /> Analytics
        </span>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">{bot ? bot.name : `Bot #${botId}`} — last {days} days.</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-sm dark:bg-slate-800">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-md px-3 py-1 font-medium ${days === d ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900" : "text-slate-500"}`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="flex h-48 items-center justify-center text-slate-500"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatTile label="Conversations" value={nf(data.conversations)} />
            <StatTile label="Leads" value={nf(data.leads)} hint="asked for a human" />
            <StatTile label="Messages" value={nf(data.messages)} />
            <StatTile label="Fallback rate" value={`${Math.round(data.fallback_rate * 100)}%`} hint={`${nf(data.fallbacks)} unanswered`} />
            <StatTile label="Tokens" value={nf(data.tokens)} />
          </div>

          {/* messages per day */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-sm font-semibold">Messages per day</h2>
            {data.messages === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">No activity yet.</div>
            ) : (
              <>
                <div className="flex h-40 items-end gap-[2px]">
                  {series.map((p) => (
                    <div
                      key={p.date}
                      className="flex-1 rounded-t bg-indigo-500/80 hover:bg-indigo-500"
                      style={{ height: `${Math.max(2, (p.count / maxCount) * 100)}%` }}
                      title={`${p.date}: ${p.count} message${p.count === 1 ? "" : "s"}`}
                      aria-label={`${p.date}: ${p.count} messages`}
                    />
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>{series[0]?.date}</span>
                  <span>{series[series.length - 1]?.date}</span>
                </div>
              </>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* top questions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-3 text-sm font-semibold">Top questions</h2>
              {data.top_questions.length === 0 ? (
                <p className="text-sm text-slate-400">No questions yet.</p>
              ) : (
                <ol className="space-y-2">
                  {data.top_questions.map((q, i) => (
                    <li key={i} className="flex items-start justify-between gap-3 text-sm">
                      <span className="min-w-0 flex-1 truncate">{q.question}</span>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{q.count}×</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* unanswered -> feed KB */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
              <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold"><HelpCircle size={15} className="text-amber-600" /> Unanswered</h2>
              <p className="mb-3 text-xs text-slate-500">Questions the bot couldn&apos;t answer — add these to its knowledge base.</p>
              {data.unanswered.length === 0 ? (
                <p className="text-sm text-slate-400">Nothing unanswered. 🎉</p>
              ) : (
                <ul className="space-y-2">
                  {data.unanswered.map((q, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 flex-1 truncate">{q.question}</span>
                      <Link href={`/dashboard/bots/${botId}/knowledge`} className="shrink-0 text-xs font-medium text-indigo-600 hover:underline">Add</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
