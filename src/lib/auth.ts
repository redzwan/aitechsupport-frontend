import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { api, API_URL, TOKEN_KEY } from "./api";

export type UserProfile = {
  id: number;
  organization_id: number;
  email: string;
  full_name: string | null;
  role: string;
  is_platform_admin: boolean;
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    return decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export async function login(email: string, password: string): Promise<void> {
  // Backend uses OAuth2 password form (username = email).
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);
  const res = await axios.post(`${API_URL}/api/v1/auth/login`, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  setToken(res.data.access_token);
}

export async function register(
  organizationName: string,
  email: string,
  password: string,
  fullName?: string
): Promise<void> {
  const res = await api.post("/auth/register", {
    organization_name: organizationName,
    email,
    password,
    full_name: fullName || null,
  });
  setToken(res.data.access_token);
}

export async function fetchMe(): Promise<UserProfile> {
  const res = await api.get("/auth/me");
  return res.data;
}

export async function updateProfile(fullName: string): Promise<UserProfile> {
  const res = await api.put("/auth/me", { full_name: fullName });
  return res.data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.post("/auth/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
}
