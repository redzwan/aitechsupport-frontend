"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isTokenValid, clearToken, fetchMe, type UserProfile } from "@/lib/auth";

/** Guard hook for protected pages: redirects to /login unless authenticated. */
export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isTokenValid()) {
      clearToken();
      router.replace("/login");
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => {
        clearToken();
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const logout = () => {
    clearToken();
    router.push("/login");
  };

  return { user, loading, logout };
}
