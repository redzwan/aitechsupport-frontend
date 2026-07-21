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
  // The shared api client defaults to application/json, which mangles FormData;
  // the backend's Form(...) also accepts urlencoded, so send that explicitly.
  const body = new URLSearchParams();
  body.append("site_url", siteUrl);
  body.append("service_account_json", saJson);
  return (
    await api.post("/admin/seo/gsc-config", body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
  ).data;
}
