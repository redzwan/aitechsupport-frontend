import api from "@/lib/api";

export interface Conversation {
  id: number;
  status: string;
  channel_kind: string | null;
  contact_name: string | null;
  contact_email: string | null;
  needs_human_at: string | null;
  last_message_at: string | null;
  created_at: string | null;
  message_count: number;
}

export interface ConversationMessage {
  id: number;
  role: string;
  content: string;
  created_at: string | null;
}

export async function listConversations(botId: number, status?: string): Promise<Conversation[]> {
  const { data } = await api.get(`/bots/${botId}/conversations`, {
    params: status ? { status } : {},
  });
  return data;
}

export async function getConversationMessages(
  botId: number,
  convId: number
): Promise<ConversationMessage[]> {
  const { data } = await api.get(`/bots/${botId}/conversations/${convId}/messages`);
  return data;
}

export async function updateConversationStatus(
  botId: number,
  convId: number,
  status: string
): Promise<Conversation> {
  const { data } = await api.patch(`/bots/${botId}/conversations/${convId}`, { status });
  return data;
}
