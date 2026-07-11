import { api } from "./api";

export type SMTPSettings = {
  host: string;
  port: number;
  username: string;
  password_set: boolean;
  from_email: string;
  from_name: string;
  security: string; // tls | ssl | none
  enabled: boolean;
};

export type SMTPUpdate = Partial<Omit<SMTPSettings, "password_set">> & { password?: string };

export type EmailTemplate = {
  id: number;
  key: string;
  name: string;
  subject: string;
  body_html: string;
  is_active: boolean;
};

export async function getSmtp(): Promise<SMTPSettings> {
  return (await api.get("/admin/smtp")).data;
}
export async function updateSmtp(p: SMTPUpdate): Promise<SMTPSettings> {
  return (await api.put("/admin/smtp", p)).data;
}
export async function sendTestEmail(toEmail: string): Promise<void> {
  await api.post("/admin/smtp/test", { to_email: toEmail });
}
export async function listTemplates(): Promise<EmailTemplate[]> {
  return (await api.get("/admin/email-templates")).data;
}
export async function updateTemplate(
  key: string,
  p: { subject?: string; body_html?: string; is_active?: boolean }
): Promise<EmailTemplate> {
  return (await api.put(`/admin/email-templates/${key}`, p)).data;
}
