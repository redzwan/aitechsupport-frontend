"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { MailCheck, Rocket } from "lucide-react";
import { checkEmail, checkoutSignup, login } from "@/lib/auth";
import { api, API_URL } from "@/lib/api";
import type { Pkg } from "@/lib/content";

type Step = "email" | "login" | "signup" | "sent";

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800";

function priceLabel(p: Pkg): string {
  return p.price_myr === 0 ? "Free" : `RM${p.price_myr}/mo`;
}

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planSlug = searchParams.get("plan") || "free";

  const [plan, setPlan] = useState<Pkg | null>(null);
  const [step, setStep] = useState<Step>("email");
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [org, setOrg] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/v1/content/packages`)
      .then((res) => (res.ok ? res.json() : []))
      .then((pkgs: Pkg[]) => setPlan(pkgs.find((p) => p.slug === planSlug) || null))
      .catch(() => setPlan(null));
  }, [planSlug]);

  const onSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const exists = await checkEmail(email.trim().toLowerCase());
      setStep(exists ? "login" : "signup");
    } catch {
      toast.error("Couldn't check that email — try again");
    } finally {
      setBusy(false);
    }
  };

  const onSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email.trim().toLowerCase(), password);
      // Best-effort: apply the chosen plan if it's free and different from the
      // current one. Paid plans are activated by the team (see billing.subscribe).
      if (plan && plan.price_myr === 0) {
        try {
          await api.post("/billing/subscribe", { package_slug: plan.slug });
        } catch {
          // Already on this plan, or a non-owner — fine, proceed to dashboard.
        }
      }
      toast.success("Signed in");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Incorrect email or password");
    } finally {
      setBusy(false);
    }
  };

  const onSubmitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await checkoutSignup(org, email.trim().toLowerCase(), fullName, planSlug);
      setStep("sent");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Couldn't create your account");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Rocket size={20} />
          </div>
          <h1 className="text-xl font-semibold">
            {step === "sent" ? "Check your email" : "Get started"}
          </h1>
          {plan && step !== "sent" && (
            <p className="mt-1 text-sm text-slate-500">
              {plan.name} plan &middot; {priceLabel(plan)}
            </p>
          )}
        </div>

        {step === "email" && (
          <form onSubmit={onSubmitEmail} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="you@company.com"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {busy ? "Checking…" : "Continue"}
            </button>
          </form>
        )}

        {step === "login" && (
          <form onSubmit={onSubmitLogin} className="space-y-4">
            <p className="text-sm text-slate-500">
              Welcome back, <span className="font-medium text-slate-700 dark:text-slate-200">{email}</span>.
              Sign in to continue.
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {busy ? "Signing in…" : "Sign in & continue"}
            </button>
            <div className="flex justify-between text-sm">
              <button type="button" onClick={() => setStep("email")} className="text-slate-500 hover:underline">
                Use a different email
              </button>
              <Link href="/forgot-password" className="font-medium text-indigo-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          </form>
        )}

        {step === "signup" && (
          <form onSubmit={onSubmitSignup} className="space-y-4">
            <p className="text-sm text-slate-500">
              No account yet for <span className="font-medium text-slate-700 dark:text-slate-200">{email}</span>.
              Let&apos;s create one.
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium">Business / organization</label>
              <input required autoFocus value={org} onChange={(e) => setOrg(e.target.value)} className={inputCls} placeholder="Acme Sdn Bhd" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Your name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="Optional" />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {busy ? "Creating…" : "Create account"}
            </button>
            <button type="button" onClick={() => setStep("email")} className="w-full text-center text-sm text-slate-500 hover:underline">
              Use a different email
            </button>
          </form>
        )}

        {step === "sent" && (
          <div className="text-center">
            <MailCheck size={32} className="mx-auto mb-3 text-indigo-600" />
            <p className="text-sm text-slate-600 dark:text-slate-300">
              We&apos;ve sent a verification link to <span className="font-medium">{email}</span>.
              Open it to verify your email and set your password.
            </p>
          </div>
        )}

        {step !== "sent" && (
          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutForm />
    </Suspense>
  );
}
