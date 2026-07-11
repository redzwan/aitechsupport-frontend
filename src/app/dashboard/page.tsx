"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot as BotIcon, KeyRound, ArrowRight, CreditCard } from "lucide-react";
import { listBots, type Bot } from "@/lib/bots";
import { getSubscription, type Subscription } from "@/lib/billing";
import { fetchMe, type UserProfile } from "@/lib/auth";

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

export default function DashboardHome() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sub, setSub] = useState<Subscription | null>(null);

  useEffect(() => {
    listBots().then(setBots).catch(() => {});
    fetchMe().then(setUser).catch(() => {});
    getSubscription().then(setSub).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <p className="mt-1 text-sm text-slate-500">
        {user ? `Signed in as ${user.email}` : " "}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
              <BotIcon size={20} />
            </div>
            <div>
              <div className="text-2xl font-semibold">{bots.length}</div>
              <div className="text-sm text-slate-500">Bots</div>
            </div>
          </div>
          <Link href="/dashboard/bots" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
            Manage bots <ArrowRight size={14} />
          </Link>
        </div>

        {sub && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950">
                <CreditCard size={20} />
              </div>
              <div>
                <div className="text-base font-semibold">{sub.plan_name} plan</div>
                <div className="text-sm text-slate-500">{fmt(sub.tokens_remaining)} of {fmt(sub.tokens_quota)} tokens left</div>
              </div>
            </div>
            <Link href="/dashboard/billing" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
              View plan &amp; usage <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {user?.is_platform_admin && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
                <KeyRound size={20} />
              </div>
              <div>
                <div className="text-base font-semibold">API Keys & Models</div>
                <div className="text-sm text-slate-500">OpenRouter, Voyage, defaults</div>
              </div>
            </div>
            <Link href="/dashboard/settings" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
              Configure <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
