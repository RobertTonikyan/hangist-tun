"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import SeasonEffect from "@/components/SeasonEffect";

type Step = "email" | "code";

// Supabase לא מאפשר לבקש קוד חדש לפני שעבר הזמן הזה
const RESEND_SECONDS = 60;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const auth = useAuth();
  const router = useRouter();

  // מי שכבר מחובר לא צריך את המסך הזה
  useEffect(() => {
    if (auth.status === "signed-in") router.replace("/");
  }, [auth.status, router]);

  // ספירה לאחור, שנייה אחרי שנייה, עד שאפשר לשלוח קוד חדש
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  async function sendCode() {
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: window.location.origin },
    });
    setBusy(false);

    if (error) {
      // "For security purposes, you can only request this after 29 seconds"
      // זו לא שגיאה אמיתית: קוד כבר נשלח לא מזמן. עוברים לספירה לאחור.
      const wait = error.message.match(/after (\d+) seconds/);
      if (wait) {
        setResendIn(Number(wait[1]));
        setStep("code");
        return;
      }
      setMessage(error.message);
      return;
    }

    setCode("");
    setStep("code");
    setResendIn(RESEND_SECONDS);
  }

  async function handleEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendCode();
  }

  async function handleCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    setBusy(false);

    // אם הקוד נכון, AuthProvider מזהה את החיבור, וה-useEffect למעלה מעביר לבית.
    if (error) setMessage(error.message);
  }

  const input =
    "w-full rounded-xl border border-eggshell/15 bg-ink/50 px-4 placeholder:text-eggshell/40 outline-none transition focus:border-eggshell/60 focus:ring-4 focus:ring-eggshell/10";
  const primary =
    "mt-2 h-12 rounded-full bg-eggshell font-semibold text-ink transition hover:bg-white active:scale-[0.98] disabled:opacity-60";
  const link = "text-eggshell/70 underline-offset-4 hover:text-eggshell hover:underline disabled:opacity-50 disabled:no-underline";

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
          {step === "code" ? (
            <div className="motion-safe:animate-rise">
              <div className="relative flex size-14 items-center justify-center rounded-full bg-eggshell/10">
                <span className="absolute inset-0 rounded-full bg-eggshell/20 motion-safe:animate-ping" />
                <svg className="relative" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </div>
              <h1 className="mt-6 text-3xl font-bold tracking-tight">Enter your code</h1>
              <p className="mt-2 text-eggshell/70">
                We sent a code to <span className="font-semibold text-eggshell">{email}</span>
              </p>

              <form onSubmit={handleCode} className="mt-8 flex flex-col gap-4">
                <label htmlFor="code" className="text-sm font-medium text-eggshell/80">
                  Code
                </label>
                <input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  minLength={6}
                  maxLength={8}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className={`${input} h-14 text-center text-2xl font-bold tracking-[0.5em]`}
                />
                <button type="submit" disabled={busy || code.length < 6} className={primary}>
                  {busy ? "Checking..." : "Sign in"}
                </button>
                {message && (
                  <p role="alert" className="text-sm text-rust-light">
                    {message}
                  </p>
                )}
              </form>

              <div className="mt-6 flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setMessage("");
                  }}
                  className={link}
                >
                  Use a different email
                </button>
                <button type="button" onClick={sendCode} disabled={busy || resendIn > 0} className={`${link} tabular-nums`}>
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight motion-safe:animate-rise motion-safe:[animation-delay:300ms]">
                Welcome home
              </h1>
              <p className="mt-2 text-eggshell/70 motion-safe:animate-rise motion-safe:[animation-delay:400ms]">
                We&apos;ll email you a sign-in code. No password needed.
              </p>

              <form
                onSubmit={handleEmail}
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
                  className={`${input} h-12`}
                />
                <button type="submit" disabled={busy} className={primary}>
                  {busy ? "Sending..." : "Send code"}
                </button>
                {message && (
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