"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Headset, Loader2, ShieldAlert, UserPlus, KeyRound, Ticket, Copy, Link2, Trash2, LogIn, Smartphone, Download, Laptop, Monitor, Terminal } from "lucide-react";
import { acceptInvite } from "@/lib/auth";
import {
  listAgents,
  createAgent,
  updateAgent,
  listInvites,
  createInvite,
  revokeInvite,
  type Agent,
  type Invite,
} from "@/lib/team";

type Release = { version?: string; build?: number; downloads?: Record<string, string> };

const DESKTOP = [
  { key: "macos", label: "macOS", note: ".dmg — drag to Applications", Icon: Laptop },
  { key: "windows", label: "Windows", note: ".zip — unzip, run Support Agent", Icon: Monitor },
  { key: "linux", label: "Linux", note: ".tar.gz — extract, run ./agent_app", Icon: Terminal },
] as const;

export default function TeamPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("agent");
  const [creating, setCreating] = useState(false);

  const [invites, setInvites] = useState<Invite[]>([]);
  const [inviteRole, setInviteRole] = useState("agent");
  const [generating, setGenerating] = useState(false);

  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  // Desktop builds are read from the release manifest, so adding a platform is
  // just an upload + a manifest edit — no redeploy of this page.
  const [release, setRelease] = useState<Release | null>(null);
  useEffect(() => {
    fetch("/downloads/latest.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((r) => setRelease(r))
      .catch(() => {});
  }, []);
  const desktops = DESKTOP.filter((d) => release?.downloads?.[d.key]);

  const load = async () => {
    try {
      const [ags, invs] = await Promise.all([listAgents(), listInvites()]);
      setAgents(ags);
      setInvites(invs);
    } catch (e: any) {
      if (e?.response?.status === 403) setForbidden(true);
      else toast.error("Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const inv = await createInvite({ role: inviteRole }); // single-use, 7-day (backend defaults)
      setInvites((p) => [inv, ...p]);
      toast.success("Invite code created");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not create invite");
    } finally {
      setGenerating(false);
    }
  };

  const revoke = async (id: number) => {
    try {
      await revokeInvite(id);
      setInvites((p) => p.filter((i) => i.id !== id));
      toast.success("Invite revoked");
    } catch {
      toast.error("Could not revoke");
    }
  };

  const copy = (text: string, what: string) => {
    navigator.clipboard?.writeText(text);
    toast.success(`${what} copied`);
  };

  const joinOrg = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      await acceptInvite(joinCode.trim());
      toast.success("Joined the organization");
      // Your org changed — reload the whole dashboard so everything re-scopes.
      window.location.href = "/dashboard";
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not join with that code");
      setJoining(false);
    }
  };

  const expiryLabel = (iso: string | null) => {
    if (!iso) return "no expiry";
    const d = new Date(iso);
    return d < new Date() ? "expired" : `expires ${d.toLocaleDateString("en-MY", { month: "short", day: "numeric" })}`;
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 6) {
      toast.error("Email and a password (min 6 chars) are required.");
      return;
    }
    setCreating(true);
    try {
      const a = await createAgent({ email: email.trim(), full_name: name.trim() || undefined, password, role });
      setAgents((prev) => [...prev, a]);
      setEmail("");
      setName("");
      setPassword("");
      setRole("agent");
      toast.success(`Created ${a.email}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Could not create agent");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (a: Agent) => {
    setBusyId(a.id);
    try {
      const updated = await updateAgent(a.id, { is_active: !a.is_active });
      setAgents((prev) => prev.map((x) => (x.id === a.id ? updated : x)));
      toast.success(updated.is_active ? "Reactivated" : "Deactivated");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const resetPassword = async (a: Agent) => {
    const pw = window.prompt(`Set a new password for ${a.email} (min 6 chars):`);
    if (pw === null) return;
    if (pw.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setBusyId(a.id);
    try {
      await updateAgent(a.id, { password: pw });
      toast.success("Password reset");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Reset failed");
    } finally {
      setBusyId(null);
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
          <ShieldAlert size={18} /> Owner or admin only
        </div>
        <p className="mt-2 text-sm">Ask your organization owner to manage support agents.</p>
      </div>
    );

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800";

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
          <Headset size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Support team</h1>
          <p className="text-sm text-slate-500">Create logins for the people who answer your customers in the agent app.</p>
        </div>
      </div>

      {/* Get the Android agent app */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <img
          src="/downloads/support-agent-qr.svg"
          alt="Scan to download the Android app"
          width={132}
          height={132}
          className="h-[132px] w-[132px] shrink-0 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Smartphone size={16} /> Get the Android app
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Scan the QR code with your Android phone, or download the APK below, to test the Support Agent
            app on your device. You may need to allow installs from your browser (unknown sources).
          </p>
          <a
            href="/downloads/support-agent.apk"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Download size={15} /> Download APK
          </a>
        </div>
      </div>

      {/* Desktop installers */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Laptop size={16} /> Install on your computer
          </div>
          {release?.version && (
            <span className="text-xs text-slate-400">
              v{release.version}
              {release.build ? ` (${release.build})` : ""}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Run the Support Agent app on your desktop so your team can answer chats without a browser.
        </p>

        {desktops.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            Desktop builds are being prepared — they&apos;ll appear here automatically once published.
          </p>
        ) : (
          <>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {desktops.map(({ key, label, note, Icon }) => (
                <a
                  key={key}
                  href={release!.downloads![key]}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                >
                  <Icon size={18} className="mt-0.5 shrink-0 text-indigo-600" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-medium">
                      {label} <Download size={13} className="text-slate-400" />
                    </div>
                    <div className="text-xs text-slate-500">{note}</div>
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-3 space-y-1.5 text-xs text-slate-400">
              <p>
                <b>macOS</b> — signed &amp; notarised by Apple: open the .dmg, drag{" "}
                <b>Support Agent</b> into Applications, and launch it. No security warning. Runs
                natively on both Apple Silicon and Intel.
              </p>
              <p>
                <b>Windows</b> — not code-signed yet, so unzip, run <b>Support Agent.exe</b>, then
                click <b>More info</b> → <b>Run anyway</b> on the SmartScreen prompt.
              </p>
              <p>
                <b>Linux</b> — extract the archive and run <b>./agent_app</b>.
              </p>
            </div>
          </>
        )}
      </div>

      <form onSubmit={onCreate} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
          <UserPlus size={16} /> Add an agent
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="agent@email.com" type="email" autoComplete="off" />
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Display name (optional)" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="Temporary password" type="password" autoComplete="new-password" />
          <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
            <option value="agent">Agent — answers chats</option>
            <option value="admin">Admin — answers + manages team</option>
          </select>
        </div>
        <button type="submit" disabled={creating} className="mt-4 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
          {creating ? "Creating…" : "Create login"}
        </button>
      </form>

      {/* Invite links — one-time, expiring */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Ticket size={16} /> Invite by code
          </div>
          <span className="text-xs text-slate-400">Single-use · expires in 7 days</span>
          <div className="ml-auto flex items-center gap-2">
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className={`${inputCls} w-auto`}>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={generate}
              disabled={generating}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {generating ? "…" : "Generate code"}
            </button>
          </div>
        </div>
        {invites.length === 0 ? (
          <p className="text-sm text-slate-500">
            No active invites. Generate a code and share it — the person joins your organization from the app or the join link.
          </p>
        ) : (
          <ul className="space-y-2">
            {invites.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
              >
                <code className="rounded bg-slate-100 px-2 py-1 text-sm dark:bg-slate-800">{inv.code}</code>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800">
                  {inv.role}
                </span>
                <span className="text-xs text-slate-400">
                  used {inv.uses}
                  {inv.max_uses != null ? `/${inv.max_uses}` : ""} · {expiryLabel(inv.expires_at)}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={() => copy(inv.code, "Code")}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <Copy size={13} /> Code
                  </button>
                  <button
                    onClick={() => copy(inv.join_url, "Join link")}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <Link2 size={13} /> Link
                  </button>
                  <button
                    onClick={() => revoke(inv.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 size={13} /> Revoke
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {agents.map((a) => (
              <tr key={a.id} className="bg-white dark:bg-slate-900">
                <td className="px-4 py-3 font-medium">{a.full_name || "—"}</td>
                <td className="px-4 py-3 text-slate-500">{a.email}</td>
                <td className="px-4 py-3">{a.role}</td>
                <td className="px-4 py-3">
                  {a.is_active ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">active</span>
                  ) : (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800">disabled</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {a.role === "owner" ? (
                      <span className="text-xs text-slate-400">owner</span>
                    ) : (
                      <>
                        <button
                          onClick={() => resetPassword(a)}
                          disabled={busyId === a.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                          <KeyRound size={13} /> Reset
                        </button>
                        <button
                          onClick={() => toggleActive(a)}
                          disabled={busyId === a.id}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-medium disabled:opacity-60 ${
                            a.is_active
                              ? "border border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
                              : "border border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950/40"
                          }`}
                        >
                          {a.is_active ? "Deactivate" : "Reactivate"}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Join another organization (moves this account into a colleague's org) */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-1 flex items-center gap-2 text-sm font-medium">
          <LogIn size={16} /> Join another organization
        </div>
        <p className="mb-3 text-xs text-slate-500">
          Have an invite code from another team? Enter it to move your account into their organization.
          If you own an organization that already has bots or members, hand it over first.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Invite code"
            className={`${inputCls} max-w-xs`}
            onKeyDown={(e) => {
              if (e.key === "Enter") joinOrg();
            }}
          />
          <button
            onClick={joinOrg}
            disabled={joining || !joinCode.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {joining ? "Joining…" : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
}
