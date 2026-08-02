import { api } from "./api";

/** The support widget that powers aichatsupport.my's own site. */
export type SiteWidget = {
  enabled: boolean;
  public_key: string;
  src: string;
  snippet: string;
};

export async function getSiteWidget(): Promise<SiteWidget> {
  return (await api.get("/admin/site-widget")).data;
}

export async function updateSiteWidget(p: {
  enabled: boolean;
  snippet: string;
}): Promise<SiteWidget> {
  return (await api.put("/admin/site-widget", p)).data;
}
