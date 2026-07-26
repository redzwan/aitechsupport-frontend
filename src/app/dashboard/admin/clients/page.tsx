"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Users, Loader2, ShieldAlert, BellRing } from "lucide-react";
import {
  adminListClients,
  adminListPackages,
  adminSetClientPlan,
  adminSetClientBillingDate,
  adminSendReminder,
  type ClientRow,
  type Package,
} from "@/lib/billing";

function toDateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [pkgs, setPkgs] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [savingOrg, setSavingOrg] = useState<number | null>(null);
  const [remindingOrg, setRemindingOrg] = useState<number | null>(null);

  const load = async () => {
    try {
      const [c, p] = await Promise.all([adminListClients(), adminListPackages()]);
      setClients(c);
      setPkgs(p);
    } catch (err: any) {
      if (err?.response?.status === 403) setForbidden(true);
      else toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const setPlan = async (orgId: number, slug: string) => {
    setSavingOrg(orgId);
    try {
      const updated = await adminSetClientPlan(orgId, slug);
      setClients((prev) => prev.map((c) => (c.organization_id === orgId ? updated : c)));
      toast.success(`Plan set to ${slug}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to set plan");
    } finally {
      setSavingOrg(null);
    }
  };

  const setBillingDate = async (orgId: number, dateStr: string) => {
    if (!dateStr) return;
    setSavingOrg(orgId);
    try {
      const updated = await adminSetClientBillingDate(orgId, dateStr);
      setClients((prev) => prev.map((c) => (c.organization_id === orgId ? updated : c)));
      toast.success("Renewal date updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to set renewal date");
    } finally {
      setSavingOrg(null);
    }
  };

  const remind = async (orgId: number) => {
    setRemindingOrg(orgId);
    try {
      await adminSendReminder(orgId);
      toast.success("Reminder sent");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to send reminder");
    } finally {
      setRemindingOrg(null);
    }
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (forbidden)
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
        <div className="flex items-center gap-2 font-medium">
          <ShieldAlert size={18} /> Platform admin only
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-sm text-slate-500">{clients.length} organization(s). Assign a plan manually while online payment is off.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3">Organization</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Bots</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Renews</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {clients.map((c) => (
              <tr key={c.organization_id} className="bg-white dark:bg-slate-900">
                <td className="px-4 py-3 font-medium">{c.organization_name}</td>
                <td className="px-4 py-3 text-slate-500">{c.owner_email || "—"}</td>
                <td className="px-4 py-3">{c.bots}</td>
                <td className="px-4 py-3 text-slate-500">
                  {fmt(c.tokens_used)} / {fmt(c.tokens_quota)}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={c.plan}
                    disabled={savingOrg === c.organization_id}
                    onChange={(e) => setPlan(c.organization_id, e.target.value)}
                    className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  >
                    {pkgs.map((p) => (
                      <option key={p.id} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                    {!pkgs.some((p) => p.slug === c.plan) && <option value={c.plan}>{c.plan}</option>}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="date"
                    defaultValue={toDateInput(c.start_date)}
                    disabled={savingOrg === c.organization_id}
                    onBlur={(e) => e.target.value && setBillingDate(c.organization_id, e.target.value)}
                    className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                    title="Start date — next renewal is 30 days after this"
                  />
                  {c.next_billing_date && (
                    <div className="mt-1 text-[11px] text-slate-400">
                      next: {new Date(c.next_billing_date).toLocaleDateString("en-MY")}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {c.next_billing_date && (
                    <button
                      onClick={() => remind(c.organization_id)}
                      disabled={remindingOrg === c.organization_id}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <BellRing size={13} /> {remindingOrg === c.organization_id ? "…" : "Remind"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
