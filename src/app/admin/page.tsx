"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Convenience URL: /admin -> the admin hub inside the dashboard shell. */
export default function AdminRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/admin");
  }, [router]);
  return null;
}
