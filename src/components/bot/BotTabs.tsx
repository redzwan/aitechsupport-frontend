"use client";

import Link from "next/link";
import { BookOpen, MessageSquare, Phone, Inbox as InboxIcon, BarChart3 } from "lucide-react";

const TABS = [
  { key: "knowledge", label: "Knowledge", icon: BookOpen },
  { key: "widget", label: "Website widget", icon: MessageSquare },
  { key: "whatsapp", label: "WhatsApp", icon: Phone },
  { key: "inbox", label: "Inbox", icon: InboxIcon },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
] as const;

export default function BotTabs({ botId, active }: { botId: string | number; active: (typeof TABS)[number]["key"] }) {
  return (
    <div className="mb-5 grid grid-cols-1 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800 sm:grid-cols-5">
      {TABS.map(({ key, label, icon: Icon }) =>
        key === active ? (
          <span
            key={key}
            className="flex items-center justify-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 shadow-sm dark:bg-slate-900"
          >
            <Icon size={15} /> {label}
          </span>
        ) : (
          <Link
            key={key}
            href={`/dashboard/bots/${botId}/${key}`}
            className="flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-white/60 dark:hover:bg-slate-900/60"
          >
            <Icon size={15} /> {label}
          </Link>
        )
      )}
    </div>
  );
}
