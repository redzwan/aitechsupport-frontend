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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <AppToaster />
        <CookieConsent />
      </body>
    </html>
  );
}
