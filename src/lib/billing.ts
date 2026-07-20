import { api } from "./api";

export type Package = {
  id: number;
  slug: string;
  name: string;
  price_myr: number;
  monthly_token_quota: number;
  max_bots: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
};

export type Subscription = {
  plan: string;
  plan_name: string;
  status: string;
  tokens_used: number;
  tokens_quota: number;
  tokens_remaining: number;
  max_bots: number;
  period_start: string | null;
};

export type ClientRow = {
  organization_id: number;
  organization_name: string;
  owner_email: string | null;
  plan: string;
  tokens_used: number;
  tokens_quota: number;
  bots: number;
  created_at: string | null;
};

export type PackageUpsert = Omit<Package, "id">;

// ----- client-facing -----
export async function listPackages(): Promise<Package[]> {
  return (await api.get("/billing/packages")).data;
}
export async function getSubscription(): Promise<Subscription> {
  return (await api.get("/billing/subscription")).data;
}
export async function subscribe(packageSlug: string): Promise<Subscription> {
  return (await api.post("/billing/subscribe", { package_slug: packageSlug })).data;
}

export type CheckoutResult = {
  payment_url: string | null; // paid plan -> redirect the browser here
  bill_id: string | null;
  subscription: Subscription | null; // free plan / downgrade -> already applied
};
export async function checkout(packageSlug: string): Promise<CheckoutResult> {
  return (await api.post("/billing/checkout", { package_slug: packageSlug })).data;
}

// ----- platform admin -----
export async function adminListPackages(): Promise<Package[]> {
  return (await api.get("/admin/packages")).data;
}
export async function adminCreatePackage(p: PackageUpsert): Promise<Package> {
  return (await api.post("/admin/packages", p)).data;
}
export async function adminUpdatePackage(id: number, p: PackageUpsert): Promise<Package> {
  return (await api.put(`/admin/packages/${id}`, p)).data;
}
export async function adminDeletePackage(id: number): Promise<void> {
  await api.delete(`/admin/packages/${id}`);
}
export async function adminListClients(): Promise<ClientRow[]> {
  return (await api.get("/admin/clients")).data;
}
export async function adminSetClientPlan(orgId: number, packageSlug: string): Promise<ClientRow> {
  return (await api.put(`/admin/clients/${orgId}/plan`, { package_slug: packageSlug })).data;
}

// ----- Billplz gateway settings (platform admin) -----
export type BillplzSettings = {
  enabled: boolean;
  sandbox: boolean;
  api_key_set: boolean;
  api_key_hint: string | null;
  x_signature_key_set: boolean;
  x_signature_key_hint: string | null;
  collection_id: string;
  configured: boolean;
};

export type BillplzUpdate = {
  enabled?: boolean;
  sandbox?: boolean;
  api_key?: string; // blank -> keep existing
  x_signature_key?: string; // blank -> keep existing
  collection_id?: string; // "" clears it
};

export async function getBillplz(): Promise<BillplzSettings> {
  return (await api.get("/admin/billplz")).data;
}
export async function updateBillplz(p: BillplzUpdate): Promise<BillplzSettings> {
  return (await api.put("/admin/billplz", p)).data;
}
export async function testBillplz(): Promise<void> {
  await api.post("/admin/billplz/test");
}
