"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { UserCircle, Loader2 } from "lucide-react";
import { fetchMe, updateProfile, changePassword, type UserProfile } from "@/lib/auth";
import { getSubscription, type Subscription } from "@/lib/billing";

export default function AccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    fetchMe()
      .then((u) => {
        setUser(u);
        setFullName(u.full_name || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    getSubscription().then(setSub).catch(() => {});
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const u = await updateProfile(fullName);
      setUser(u);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPw(true);
    try {
      await changePassword(currentPw, newPw);
      setCurrentPw("");
      setNewPw("");
      toast.success("Password changed");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to change password");
    } finally {
      setChangingPw(false);
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
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
          <UserCircle size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Account</h1>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
      </div>

      {/* At-a-glance */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Info label="Role" value={user?.role || "—"} />
        <Info label="Plan" value={sub?.plan_name || "—"} />
        <Info label="Bots allowed" value={sub ? String(sub.max_bots) : "—"} />
      </div>

      {/* Profile */}
      <form onSubmit={saveProfile} className="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Profile</h2>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input value={user?.email || ""} disabled className={`${inputCls} opacity-60`} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="Your name" />
        </div>
        <button type="submit" disabled={savingProfile} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
          {savingProfile ? "Saving…" : "Save profile"}
        </button>
      </form>

      {/* Password */}
      <form onSubmit={savePassword} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Change password</h2>
        <div>
          <label className="mb-1 block text-sm font-medium">Current password</label>
          <input type="password" required value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className={inputCls} autoComplete="current-password" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">New password</label>
          <input type="password" required minLength={6} value={newPw} onChange={(e) => setNewPw(e.target.value)} className={inputCls} placeholder="At least 6 characters" autoComplete="new-password" />
        </div>
        <button type="submit" disabled={changingPw} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
          {changingPw ? "Changing…" : "Change password"}
        </button>
      </form>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-medium capitalize">{value}</div>
    </div>
  );
}
