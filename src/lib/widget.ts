import api from "@/lib/api";

export interface WidgetAppearance {
  title: string;
  subtitle: string;
  greeting: string;
  primary_color: string;
  position: "right" | "left";
  launcher_label: string;
  theme: "auto" | "light" | "dark";
}

export interface WidgetConfig {
  enabled: boolean;
  public_key: string;
  allowed_origins: string[];
  appearance: WidgetAppearance;
  daily_message_cap: number | null;
  src_url: string;
  snippet: string;
}

export interface WidgetConfigUpdate {
  enabled?: boolean;
  allowed_origins?: string[];
  appearance?: Partial<WidgetAppearance>;
  daily_message_cap?: number | null;
}

export async function getWidgetConfig(botId: number): Promise<WidgetConfig> {
  const { data } = await api.get(`/bots/${botId}/widget`);
  return data;
}

export async function updateWidgetConfig(
  botId: number,
  patch: WidgetConfigUpdate
): Promise<WidgetConfig> {
  const { data } = await api.put(`/bots/${botId}/widget`, patch);
  return data;
}

export async function rotateWidgetKey(botId: number): Promise<WidgetConfig> {
  const { data } = await api.post(`/bots/${botId}/widget/rotate-key`);
  return data;
}
