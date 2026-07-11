import { api } from "./api";

export type Bot = {
  id: number;
  organization_id: number;
  name: string;
  system_prompt: string | null;
  fallback_message: string | null;
  chat_model: string | null;
  is_active: boolean;
};

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
  chat_model?: string;
}): Promise<Bot> {
  const res = await api.post("/bots", payload);
  return res.data;
}

export async function listModels(): Promise<ModelOption[]> {
  const res = await api.get("/bots/models");
  return res.data;
}
