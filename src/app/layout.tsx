import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AiTechSupport — AI Support Chatbot for your website & WhatsApp",
  description:
    "Connect your content and WhatsApp number. Let an AI assistant answer your customers, with human handoff when it matters.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
