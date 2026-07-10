import axios from "axios";

// Base URL comes from the environment. Falls back to local backend for dev.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8100";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT (stored client-side) to every request.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
