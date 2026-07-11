import { api } from "./api";

export type SettingsOut = {
  openrouter_api_key_set: boolean;
  openrouter_api_key_hint: string | null;
  voyage_api_key_set: boolean;
  voyage_api_key_hint: string | null;
  openrouter_base_url: string;
  default_chat_model: string;
};

export type SettingsUpdate = {
  openrouter_api_key?: string;
  voyage_api_key?: string;
  openrouter_base_url?: string;
  default_chat_model?: string;
};

export async function getSettings(): Promise<SettingsOut> {
  const res = await api.get("/admin/settings");
  return res.data;
}

export async function updateSettings(payload: SettingsUpdate): Promise<SettingsOut> {
  const res = await api.put("/admin/settings", payload);
  return res.data;
}
