"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Bot as BotIcon, Plus, Loader2 } from "lucide-react";
import { listBots, createBot, listModels, type Bot, type ModelOption } from "@/lib/bots";

export default function BotsPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [chatModel, setChatModel] = useState("");

  useEffect(() => {
    Promise.all([listBots(), listModels()])
      .then(([b, m]) => {
        setBots(b);
        setModels(m);
      })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const modelLabel = (id: string | null) => {
    if (!id) return "Default";
    return models.find((m) => m.id === id)?.label || id;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const bot = await createBot({
        name,
        system_prompt: systemPrompt || undefined,
        chat_model: chatModel || undefined,
      });
      setBots((prev) => [...prev, bot]);
      setName("");
      setSystemPrompt("");
      setChatModel("");
      setShowForm(false);
      toast.success("Bot created");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create bot");
    } finally {
      setCreating(false);
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
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bots</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} /> New bot
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Acme Helpdesk" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">System prompt</label>
            <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={3} className={inputCls} placeholder="You are Acme's friendly support agent…" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Model</label>
            <select value={chatModel} onChange={(e) => setChatModel(e.target.value)} className={inputCls}>
              <option value="">Platform default</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} — {m.provider}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={creating} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
            {creating ? "Creating…" : "Create bot"}
          </button>
        </form>
      )}

      {bots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
          <BotIcon className="mx-auto mb-2 opacity-40" />
          No bots yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-3">
          {bots.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
                  <BotIcon size={18} />
                </div>
                <div>
                  <div className="font-medium">{b.name}</div>
                  <div className="text-xs text-slate-500">Model: {modelLabel(b.chat_model)}</div>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${b.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-500"}`}>
                {b.is_active ? "active" : "inactive"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
