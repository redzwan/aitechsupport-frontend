import axios from "axios";

// Base URL comes from the environment. Falls back to local backend for dev.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8100";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

export const TOKEN_KEY = "access_token";

// Attach the JWT (stored client-side) to every request.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// On an expired/invalid token, bounce to login (but not for the login call itself).
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error?.response?.status === 401 &&
      !window.location.pathname.startsWith("/login")
    ) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
