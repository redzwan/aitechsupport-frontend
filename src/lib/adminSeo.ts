import { api } from "./api";

export type GscStatus = {
  configured: boolean;
  site_url?: string;
  client_email?: string | null;
};

export type GscMetricRow = {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GscMetrics = {
  range: { start: string; end: string; days: number };
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  top_queries: GscMetricRow[];
  top_pages: GscMetricRow[];
};

export async function gscStatus(): Promise<GscStatus> {
  return (await api.get("/admin/seo/gsc-status")).data;
}

export async function gscMetrics(): Promise<GscMetrics> {
  return (await api.get("/admin/seo/metrics")).data;
}

export async function saveGscConfig(
  siteUrl: string,
  saJson: string
): Promise<{ message: string; client_email?: string; site_url: string }> {
  const form = new FormData();
  form.append("site_url", siteUrl);
  form.append("service_account_json", saJson);
  // Let the browser/axios set multipart Content-Type (with boundary) itself.
  return (await api.post("/admin/seo/gsc-config", form)).data;
}
