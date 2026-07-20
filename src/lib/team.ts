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
