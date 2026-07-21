import type { Metadata } from "next";
import "./globals.css";
import AppToaster from "@/components/AppToaster";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  metadataBase: new URL("https://aitechsupport.my"),
  title: {
    default: "AiTechSupport — AI Support Chatbot for your website & WhatsApp",
    template: "%s",
  },
  description:
    "Connect your content and let an AI assistant answer your customers 24/7 on your website, with a real human handoff when it matters.",
  applicationName: "AiTechSupport",
  keywords: ["AI chatbot", "customer support", "support automation", "WhatsApp bot", "website chat widget", "Malaysia"],
  openGraph: {
    type: "website",
    siteName: "AiTechSupport",
    url: "https://aitechsupport.my",
    title: "AiTechSupport — AI Support Chatbot for your website & WhatsApp",
    description: "AI support that answers on your website, with a real human handoff when it matters.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AiTechSupport — AI Support Chatbot",
    description: "AI support that answers on your website, with a real human handoff when it matters.",
  },
  robots: { index: true, follow: true },
};

// Our own support widget, configured in Admin → Support. Read at render time
// (cached ~2 min) and never blocks the page — if the API is unreachable we just
// render no widget.
async function getSiteWidget(): Promise<{ enabled: boolean; src: string; public_key: string } | null> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/v1/public/site-widget`, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const widget = await getSiteWidget();
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <AppToaster />
        <CookieConsent />
        {widget?.enabled && widget.src && widget.public_key && (
          <script src={widget.src} data-public-key={widget.public_key} defer />
        )}
      </body>
    </html>
  );
}
