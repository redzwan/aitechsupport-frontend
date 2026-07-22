"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Loader2, ExternalLink } from "lucide-react";
import { updateBot, HANDOFF_MODES, type Bot, type HandoffMode } from "@/lib/bots";

/** Always a string: FastAPI returns `detail` as a list for validation errors,
 *  and handing that to toast/JSX would crash React. */
function errMsg(e: any, fallback: string): string {
  const d = e?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x?.msg).filter(Boolean).join("; ") || fallback;
  return fallback;
}

/** Mirror of the server's normalizer, for instant preview only — the API is
 *  authoritative and re-normalizes on save.
 *
 *  A number typed in local trunk form ("012-345 6789") is ambiguous: we can only
 *  assume Malaysia. That guess is exactly why the resolved number is shown back
 *  to the owner below the field — an Australian number typed as "0412 345 678"
 *  would silently become a Malaysian one otherwise.
 */
function previewNumber(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  const intl = s.startsWith("+");
  let digits = s.replace(/\D/g, "");
  if (!digits) return null;
  if (!intl) {
    if (digits.startsWith("00")) digits = digits.slice(2);
    else if (digits.startsWith("0")) digits = "60" + digits.slice(1);
  }
  if (digits.length < 7 || digits.length > 15) return null;
  return digits;
}

export default function HandoffSettings({
  bot,
  onSaved,
}: {
  bot: Bot;
  onSaved: (b: Bot) => void;
}) {
  const [mode, setMode] = useState<HandoffMode>(bot.handoff_mode ?? "form");
  const [number, setNumber] = useState(bot.whatsapp_number ?? "");
  const [saving, setSaving] = useState(false);

  const needsNumber = mode === "whatsapp" || mode === "both";
  const resolved = previewNumber(number);
  const dirty = mode !== (bot.handoff_mode ?? "form") || number !== (bot.whatsapp_number ?? "");

  const save = async () => {
    if (needsNumber && !resolved) {
      toast.error("Enter a valid WhatsApp number with country code");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateBot(bot.id, {
        handoff_mode: mode,
        whatsapp_number: number.trim() ? number.trim() : null,
      });
      onSaved(updated);
      setNumber(updated.whatsapp_number ?? "");
      toast.success("Handoff settings saved");
    } catch (err: any) {
      toast.error(errMsg(err, "Failed to save handoff settings"));
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800";

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        What the visitor is offered when the bot can&apos;t answer.
      </p>

      <div className="grid gap-2 md:grid-cols-3">
        {HANDOFF_MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
            aria-pressed={mode === m.value}
            className={`rounded-lg border p-3 text-left transition ${
              mode === m.value
                ? "border-indigo-500 bg-white ring-2 ring-indigo-500/30 dark:bg-slate-800"
                : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800"
            }`}
          >
            <div className="text-sm font-medium">{m.label}</div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{m.hint}</div>
          </button>
        ))}
      </div>

      {needsNumber && (
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium" htmlFor={`wa-${bot.id}`}>
            WhatsApp number
          </label>
          <input
            id={`wa-${bot.id}`}
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="+60 12-345 6789"
            className={inputCls}
          />
          {number.trim() && !resolved && (
            <p className="mt-1 text-xs text-rose-600">
              That doesn&apos;t look like a valid number. Include the country code.
            </p>
          )}
          {resolved && (
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Messages go to <span className="font-medium text-slate-700 dark:text-slate-200">+{resolved}</span>
                {!number.trim().startsWith("+") && (
                  <span className="ml-1 text-amber-600">
                    — no country code given, assumed Malaysia (+60)
                  </span>
                )}
              </span>
              <a
                href={`https://wa.me/${resolved}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline"
              >
                Test <ExternalLink size={11} />
              </a>
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Save
        </button>
        {dirty && <span className="text-xs text-slate-500">Unsaved changes</span>}
      </div>
    </div>
  );
}
