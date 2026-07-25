import { api } from "./api";

export type WhatsAppConnectionStatus = "disconnected" | "pending_qr" | "connected";

export type WhatsAppStatus = {
  connection_status: WhatsAppConnectionStatus;
  is_active: boolean;
  /** Whether the org's current package allows connecting WhatsApp at all. */
  plan_allows_whatsapp: boolean;
};

export type WhatsAppConnect = {
  connection_status: WhatsAppConnectionStatus;
  qr_base64: string | null;
};

export async function getWhatsApp(botId: number): Promise<WhatsAppStatus> {
  return (await api.get(`/bots/${botId}/whatsapp`)).data;
}

export async function getWhatsAppStatus(botId: number): Promise<WhatsAppStatus> {
  return (await api.get(`/bots/${botId}/whatsapp/status`)).data;
}

export async function connectWhatsApp(botId: number): Promise<WhatsAppConnect> {
  return (await api.post(`/bots/${botId}/whatsapp/connect`)).data;
}

export async function disconnectWhatsApp(botId: number): Promise<WhatsAppStatus> {
  return (await api.post(`/bots/${botId}/whatsapp/disconnect`)).data;
}
