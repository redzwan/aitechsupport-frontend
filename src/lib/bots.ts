import { api } from "./api";

export type Bot = {
  id: number;
  organization_id: number;
  name: string;
  system_prompt: string | null;
  fallback_message: string | null;
  /** The model actually answering this bot — set by your plan's package, read-only. */
  effective_chat_model: string;
  is_active: boolean;
  /** What a visitor is offered when the bot can't answer. */
  handoff_mode: HandoffMode;
  /** Digits only, international, no '+' — normalized by the API on save. */
  whatsapp_number: string | null;
};

export type HandoffMode = "form" | "whatsapp" | "both";

export const HANDOFF_MODES: { value: HandoffMode; label: string; hint: string }[] = [
  { value: "form", label: "Contact form",
    hint: "Visitor leaves name and email; you reply from the Inbox." },
  { value: "whatsapp", label: "WhatsApp only",
    hint: "Visitor is handed to your WhatsApp with the chat so far." },
  { value: "both", label: "WhatsApp + form",
    hint: "WhatsApp first, with the form underneath as a fallback." },
];

export type ModelOption = {
  id: string;
  label: string;
  provider: string;
};

export async function listBots(): Promise<Bot[]> {
  const res = await api.get("/bots");
  return res.data;
}

export async function getBot(botId: number): Promise<Bot | undefined> {
  const bots = await listBots();
  return bots.find((b) => b.id === botId);
}

export async function createBot(payload: {
  name: string;
  system_prompt?: string;
}): Promise<Bot> {
  const res = await api.post("/bots", payload);
  return res.data;
}

/** Partial update — only the supplied fields change. */
export async function updateBot(
  botId: number,
  payload: {
    name?: string;
    system_prompt?: string;
    fallback_message?: string;
    is_active?: boolean;
    handoff_mode?: HandoffMode;
    whatsapp_number?: string | null;
  }
): Promise<Bot> {
  const res = await api.patch(`/bots/${botId}`, payload);
  return res.data;
}

/** Model catalog for the admin Packages picker (not the bot form — customers
 *  no longer choose a model, the org's package decides it). */
export async function listModels(): Promise<ModelOption[]> {
  const res = await api.get("/bots/models");
  return res.data;
}
