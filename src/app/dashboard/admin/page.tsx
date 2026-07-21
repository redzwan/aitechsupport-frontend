"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Boxes, Users, KeyRound, HardDrive, ArrowRight, ShieldAlert, Loader2, LayoutTemplate, FileText, CreditCard, Receipt, LifeBuoy } from "lucide-react";
import { fetchMe, type UserProfile } from "@/lib/auth";
import { adminListClients, type ClientRow } from "@/lib/billing";

export default function AdminHub() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    fetchMe().then(setUser).catch(() => {});
    adminListClients()
      .then(setClients)
      .catch((e: any) => {
        if (e?.response?.status === 403) setForbidden(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (forbidden || (user && !user.is_platform_admin)) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
        <div className="flex items-center gap-2 font-medium">
          <ShieldAlert size={18} /> Platform admin only
        </div>
        <p className="mt-2 text-sm">This area is for the platform operator.</p>
      </div>
    );
  }

  const paying = clients.filter((c) => c.plan !== "free").length;
  const cards = [
    { href: "/dashboard/admin/homepage", label: "Homepage", desc: "Edit the landing page", icon: LayoutTemplate },
    { href: "/dashboard/admin/pages", label: "Pages", desc: "About, Privacy, Terms…", icon: FileText },
    { href: "/dashboard/admin/packages", label: "Packages", desc: "Plans you sell", icon: Boxes },
    { href: "/dashboard/admin/clients", label: "Clients", desc: `${clients.length} total · ${paying} paying`, icon: Users },
    { href: "/dashboard/admin/billing", label: "Payments", desc: "Billplz gateway & sandbox", icon: CreditCard },
    { href: "/dashboard/admin/payments", label: "Transactions", desc: "Bills & revenue", icon: Receipt },
    { href: "/dashboard/settings", label: "API Keys & Models", desc: "OpenRouter, Voyage, defaults", icon: KeyRound },
    { href: "/dashboard/admin/storage", label: "Storage", desc: "AIStor bucket for uploads", icon: HardDrive },
    { href: "/dashboard/admin/support", label: "Support widget", desc: "Chat bubble on our own site", icon: LifeBuoy },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">Platform admin</h1>
      <p className="mt-1 text-sm text-slate-500">Manage the AiTechSupport storefront.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Clients" value={clients.length} />
        <Stat label="Paying" value={paying} />
        <Stat label="Bots (all clients)" value={clients.reduce((n, c) => n + c.bots, 0)} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map(({ href, label, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
              <Icon size={20} />
            </div>
            <div className="font-semibold">{label}</div>
            <div className="text-sm text-slate-500">{desc}</div>
            <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
              Open <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}
