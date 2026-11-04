"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; session: Session };

const AuthContext = createContext<AuthState>({ status: "loading" });

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  // undefined = עוד בודקים, null = לא מחובר, Session = מחובר
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const state: AuthState =
    session === undefined
      ? { status: "loading" }
      : session === null
        ? { status: "signed-out" }
        : { status: "signed-in", session };

  return <AuthContext value={state}>{children}</AuthContext>;
}