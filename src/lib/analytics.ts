import api from "@/lib/api";

export interface AnalyticsPoint {
  date: string;
  count: number;
}
export interface TopQuestion {
  question: string;
  count: number;
}
export interface UnansweredQuestion {
  question: string;
  at: string | null;
}
export interface WidgetAnalytics {
  days: number;
  conversations: number;
  leads: number;
  messages: number;
  user_messages: number;
  tokens: number;
  fallbacks: number;
  fallback_rate: number;
  series: AnalyticsPoint[];
  top_questions: TopQuestion[];
  unanswered: UnansweredQuestion[];
}

export async function getWidgetAnalytics(botId: number, days = 30): Promise<WidgetAnalytics> {
  const { data } = await api.get(`/bots/${botId}/widget/analytics`, { params: { days } });
  return data;
}
