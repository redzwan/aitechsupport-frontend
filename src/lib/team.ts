import { api } from "./api";

export type Agent = {
  id: number;
  email: string;
  full_name: string | null;
  role: string; // owner | admin | agent
  is_active: boolean;
  created_at: string | null;
};

export type AgentCreate = {
  email: string;
  full_name?: string;
  password: string;
  role?: string; // agent | admin
};

export type AgentUpdate = {
  full_name?: string;
  role?: string;
  is_active?: boolean;
  password?: string;
};

export async function listAgents(): Promise<Agent[]> {
  return (await api.get("/team/agents")).data;
}
export async function createAgent(p: AgentCreate): Promise<Agent> {
  return (await api.post("/team/agents", p)).data;
}
export async function updateAgent(id: number, p: AgentUpdate): Promise<Agent> {
  return (await api.patch(`/team/agents/${id}`, p)).data;
}

export type Invite = {
  id: number;
  code: string;
  role: string;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string | null;
  join_url: string;
};

export type InviteCreate = {
  role?: string;
  max_uses?: number | null; // null = unlimited
  expires_in_hours?: number | null; // null = never
};

export async function listInvites(): Promise<Invite[]> {
  return (await api.get("/team/invites")).data;
}
export async function createInvite(p: InviteCreate): Promise<Invite> {
  return (await api.post("/team/invites", p)).data;
}
export async function revokeInvite(id: number): Promise<void> {
  await api.delete(`/team/invites/${id}`);
}

// ===== Live presence =====
// Same roster the agent app shows. The Support team page reads it so an owner
// can see, before a customer does, whether anyone is on duty to take a handoff.

export type PresenceRow = {
  user_id: number;
  name: string;
  role: string;
  status: "online" | "busy" | "away" | "offline";
  last_seen_at: string | null;
};

export async function listPresence(): Promise<PresenceRow[]> {
  return (await api.get("/agent/presence")).data;
}

// ===== Offline fallback contacts =====

export type SupportContact = {
  support_email: string | null;
  support_whatsapp: string | null;
  whatsapp_valid: boolean;
};

export async function getSupportContact(): Promise<SupportContact> {
  return (await api.get("/team/support-contact")).data;
}

export async function updateSupportContact(p: {
  support_email?: string;
  support_whatsapp?: string;
}): Promise<SupportContact> {
  return (await api.put("/team/support-contact", p)).data;
}
