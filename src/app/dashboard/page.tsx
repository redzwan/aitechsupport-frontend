"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot as BotIcon, KeyRound, ArrowRight } from "lucide-react";
import { listBots, type Bot } from "@/lib/bots";
import { fetchMe, type UserProfile } from "@/lib/auth";

export default function DashboardHome() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    listBots().then(setBots).catch(() => {});
    fetchMe().then(setUser).catch(() => {});
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
