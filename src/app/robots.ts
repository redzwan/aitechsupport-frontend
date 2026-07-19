import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard/", "/admin/"] },
    sitemap: "https://aitechsupport.my/sitemap.xml",
    host: "https://aitechsupport.my",
  };
}
