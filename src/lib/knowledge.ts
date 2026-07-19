import axios from "axios";
import { api, API_URL } from "./api";
import { getToken } from "./auth";

export type KnowledgeSource = {
  id: number;
  organization_id: number;
  bot_id: number;
  source_type: string; // url | text | file
  title: string | null;
  location: string | null;
  status: string; // pending | processing | ready | failed
  chunk_count: number;
  has_file: boolean; // an original upload is stored and downloadable
  file_size: number | null;
};

export async function listKnowledge(botId: number): Promise<KnowledgeSource[]> {
  const res = await api.get(`/bots/${botId}/knowledge`);
  return res.data;
}

export async function addKnowledge(
  botId: number,
  payload: { source_type: "url" | "text"; location?: string; title?: string; text?: string }
): Promise<KnowledgeSource> {
  const res = await api.post(`/bots/${botId}/knowledge`, payload);
  return res.data;
}

export async function uploadKnowledge(botId: number, file: File): Promise<KnowledgeSource> {
  const fd = new FormData();
  fd.append("file", file);
  // Direct axios call so it sets the multipart boundary itself.
  const res = await axios.post(`${API_URL}/api/v1/bots/${botId}/knowledge/upload`, fd, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
}

export async function deleteKnowledge(sourceId: number): Promise<void> {
  await api.delete(`/knowledge/${sourceId}`);
}

// Fetch a short-lived presigned URL for the stored original file.
export async function knowledgeDownloadUrl(sourceId: number): Promise<string> {
  const res = await api.get(`/knowledge/${sourceId}/download`);
  return res.data.url as string;
}
