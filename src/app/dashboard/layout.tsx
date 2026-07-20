"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Bot, CreditCard, UserCircle, Boxes, Users, KeyRound, Mail, FileText, HardDrive, Receipt, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 dark:bg-slate-950">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const clientNav = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/bots", label: "Bots", icon: Bot },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
    { href: "/dashboard/account", label: "Account", icon: UserCircle },
  ];
  const adminNav = [
    { href: "/dashboard/admin", label: "Admin home", icon: LayoutDashboard },
    { href: "/dashboard/admin/packages", label: "Packages", icon: Boxes },
    { href: "/dashboard/admin/clients", label: "Clients", icon: Users },
    { href: "/dashboard/admin/billing", label: "Payments (Billplz)", icon: CreditCard },
    { href: "/dashboard/admin/payments", label: "Transactions", icon: Receipt },
    { href: "/dashboard/settings", label: "API Keys & Models", icon: KeyRound },
    { href: "/dashboard/admin/storage", label: "Storage", icon: HardDrive },
    { href: "/dashboard/admin/email", label: "Email (SMTP)", icon: Mail },
    { href: "/dashboard/admin/email-templates", label: "Email templates", icon: FileText },
  ];

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
          active
            ? "bg-indigo-600 text-white"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        }`}
      >
        <Icon size={18} />
        {label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="px-5 py-5 text-lg font-semibold">
          AiTech<span className="text-indigo-600">Support</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {clientNav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
          {user.is_platform_admin && (
            <>
              <div className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Platform admin
              </div>
              {adminNav.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </>
          )}
        </nav>
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <div className="mb-2 px-2 text-xs text-slate-500">
            {user.email}
            {user.is_platform_admin && (
              <span className="ml-1 rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                admin
              </span>
            )}
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto px-8 py-8">{children}</main>
    </div>
  );
}
