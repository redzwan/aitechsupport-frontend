import { api } from "./api";

export type StorageSettings = {
  endpoint: string;
  access_key: string;
  secret_key_set: boolean;
  secret_key_hint: string | null;
  bucket: string;
  secure: boolean;
  enabled: boolean;
};

export type StorageUpdate = {
  endpoint?: string;
  access_key?: string;
  secret_key?: string; // blank -> keep existing
  bucket?: string;
  secure?: boolean;
  enabled?: boolean;
};

export async function getStorage(): Promise<StorageSettings> {
  return (await api.get("/admin/storage")).data;
}
export async function updateStorage(p: StorageUpdate): Promise<StorageSettings> {
  return (await api.put("/admin/storage", p)).data;
}
export async function testStorage(): Promise<void> {
  await api.post("/admin/storage/test");
}
