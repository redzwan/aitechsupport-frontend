import api from "@/lib/api";

export interface Conversation {
  id: number;
  status: string;
  channel_kind: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  needs_human_at: string | null;
  assigned_user_id: number | null;
  assignee_name: string | null;
  last_message_at: string | null;
  created_at: string | null;
  message_count: number;
}

export interface ConversationMessage {
  id: number;
  role: string;
  content: string;
  sender_user_id: number | null;
  created_at: string | null;
  sender_name?: string | null;
  /** Short-lived presigned URL, refreshed on each poll. Null once the 90-day
   *  retention rule has expired the object — render a placeholder, not an error. */
  image_url?: string | null;
  image_mime?: string | null;
}

export interface UploadedImage {
  image_key: string;
  url: string;
  mime: string;
  size: number;
}

/** Upload an image to attach to the next agent reply in this conversation. */
export async function uploadConversationImage(
  botId: number,
  convId: number,
  file: File
): Promise<UploadedImage> {
  const form = new FormData();
  form.append("file", file);
  // The shared client defaults to application/json. Setting "multipart/form-data"
  // by hand omits the boundary and the server can't parse it, so clear the header
  // entirely and let the browser generate `multipart/form-data; boundary=…`.
  const { data } = await api.post(`/bots/${botId}/conversations/${convId}/upload`, form, {
    headers: { "Content-Type": undefined as unknown as string },
  });
  return data;
}

export async function claimConversation(botId: number, convId: number): Promise<Conversation> {
  const { data } = await api.post(`/bots/${botId}/conversations/${convId}/claim`);
  return data;
}

export async function replyToConversation(
  botId: number,
  convId: number,
  content: string,
  imageKey?: string
): Promise<ConversationMessage> {
  const { data } = await api.post(`/bots/${botId}/conversations/${convId}/reply`, {
    content,
    image_key: imageKey,
  });
  return data;
}

export async function releaseConversation(botId: number, convId: number): Promise<Conversation> {
  const { data } = await api.post(`/bots/${botId}/conversations/${convId}/release`);
  return data;
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
