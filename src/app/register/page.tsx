"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { UserPlus } from "lucide-react";
import { register } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [org, setOrg] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(org, email, password, fullName);
      toast.success("Account created");
      router.push("/dashboard");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <UserPlus size={20} />
          </div>
          <h1 className="text-xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Start your support bot</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Business / organization</label>
            <input required value={org} onChange={(e) => setOrg(e.target.value)} className={inputCls} placeholder="Acme Sdn Bhd" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Your name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="Optional" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@company.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="At least 6 characters" />
          </div>
          <button type="submit" disabled={busy} className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60">
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
