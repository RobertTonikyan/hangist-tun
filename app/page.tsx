"use client";

import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

function Home() {
  const auth = useAuth();
  const email = auth.status === "signed-in" ? auth.session.user.email : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">שלום!</h1>
      <p className="text-eggshell/70" dir="ltr">
        {email}
      </p>
      <button
        type="button"
        onClick={() => supabase.auth.signOut()}
        className="h-11 rounded-full border border-eggshell/30 px-6 transition hover:bg-eggshell/10"
      >
        התנתקות
      </button>
    </main>
  );
}

export default function HomePage() {
  return (
    <RequireAuth>
      <Home />
    </RequireAuth>
  );
}