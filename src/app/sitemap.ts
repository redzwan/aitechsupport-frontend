import type { MetadataRoute } from "next";
import { getPageLinks } from "@/lib/content";

const BASE = "https://aitechsupport.my";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = (await getPageLinks()) ?? [];
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/register`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`, changeFrequency: "monthly", priority: 0.5 },
    ...pages.map((p) => ({
      url: `${BASE}/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
