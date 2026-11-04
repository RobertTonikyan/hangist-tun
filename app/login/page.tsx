"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import SeasonEffect from "@/components/SeasonEffect";

type Status = "idle" | "sending" | "sent" | "error";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const auth = useAuth();
  const router = useRouter();

  // מי שכבר מחובר לא צריך את המסך הזה
  useEffect(() => {
    if (auth.status === "signed-in") router.replace("/");
  }, [auth.status, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      setMessage(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink" dir="ltr">
      <div className="absolute inset-0 bg-[url(/ararat.jpg)] bg-cover bg-center motion-safe:animate-drift" />
      <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/40 to-ink/30" />
      <SeasonEffect />

      <div className="relative flex min-h-screen flex-col justify-between p-8 md:p-12">
        <header className="flex items-center gap-3 motion-safe:animate-fade">
          <span className="flex size-10 items-center justify-center rounded-full border border-eggshell/30 text-sm font-bold tracking-wider">
            HT
          </span>
          <span className="text-sm font-medium tracking-[0.2em] text-eggshell/80">HANGIST TUN</span>
        </header>

        <section className="glass mx-auto w-full max-w-md rounded-3xl p-10 motion-safe:animate-rise motion-safe:[animation-delay:150ms]">
          {status === "sent" ? (
            <div className="text-center motion-safe:animate-rise">
              <div className="relative mx-auto flex size-14 items-center justify-center rounded-full bg-eggshell/10">
                <span className="absolute inset-0 rounded-full bg-eggshell/20 motion-safe:animate-ping" />
                <svg className="relative" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </div>
              <h1 className="mt-6 text-2xl font-bold">Check your inbox</h1>
              <p className="mt-2 text-eggshell/70">
                We sent a sign-in link to <span className="font-semibold text-eggshell">{email}</span>
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-8 text-sm text-eggshell/70 underline-offset-4 hover:text-eggshell hover:underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight motion-safe:animate-rise motion-safe:[animation-delay:300ms]">
                Welcome home
              </h1>
              <p className="mt-2 text-eggshell/70 motion-safe:animate-rise motion-safe:[animation-delay:400ms]">
                Sign in with a link sent to your email. No password needed.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-8 flex flex-col gap-4 motion-safe:animate-rise motion-safe:[animation-delay:500ms]"
              >
                <label htmlFor="email" className="text-sm font-medium text-eggshell/80">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-eggshell/15 bg-ink/50 px-4 placeholder:text-eggshell/40 outline-none transition focus:border-eggshell/60 focus:ring-4 focus:ring-eggshell/10"
                />
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-2 h-12 rounded-full bg-eggshell font-semibold text-ink transition hover:bg-white active:scale-[0.98] disabled:opacity-60"
                >
                  {status === "sending" ? "Sending..." : "Send magic link"}
                </button>
                {status === "error" && (
                  <p role="alert" className="text-sm text-rust-light">
                    {message}
                  </p>
                )}
              </form>
            </>
          )}
        </section>

        <footer className="text-xs tracking-wide text-eggshell/60 motion-safe:animate-fade motion-safe:[animation-delay:700ms]">
          Yerevan · Mount Ararat
        </footer>
      </div>
    </main>
  );
}