import api from "@/lib/api";
import type { Homepage } from "@/lib/content";

export interface AdminPage {
  id: number;
  slug: string;
  title: string;
  body: string | null;
  meta_description: string | null;
  is_published: boolean;
  sort_order: number;
  updated_at: string | null;
}

export async function getHomepageAdmin(): Promise<Homepage> {
  const { data } = await api.get("/admin/homepage");
  return data;
}

export async function updateHomepage(content: Homepage): Promise<Homepage> {
  const { data } = await api.put("/admin/homepage", { content });
  return data;
}

export async function listPages(): Promise<AdminPage[]> {
  const { data } = await api.get("/admin/pages");
  return data;
}

export async function createPage(p: {
  slug: string;
  title: string;
  body?: string;
  meta_description?: string;
  is_published?: boolean;
  sort_order?: number;
}): Promise<AdminPage> {
  const { data } = await api.post("/admin/pages", p);
  return data;
}

export async function updatePage(id: number, p: Partial<AdminPage>): Promise<AdminPage> {
  const { data } = await api.put(`/admin/pages/${id}`, p);
  return data;
}

export async function deletePage(id: number): Promise<void> {
  await api.delete(`/admin/pages/${id}`);
}
