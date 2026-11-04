"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.status === "signed-out") router.replace("/login");
  }, [auth.status, router]);

  if (auth.status !== "signed-in") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-eggshell/60 motion-safe:animate-pulse">טוען...</p>
      </main>
    );
  }

  return children;
}