"use client";

import { useState } from "react";
import { createKeyRecord } from "@/lib/crypto";
import type { KeyRecord } from "@/lib/crypto";
import { saveKeyRecord } from "@/lib/db/journal";
import { field, primaryButton } from "./styles";

const MIN_LENGTH = 8;

// פעם אחת: בוחרים סיסמה ליומן
export default function SetupLock({ onDone }: { onDone: (record: KeyRecord) => void }) {
  const [passphrase, setPassphrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tooShort = passphrase.length < MIN_LENGTH;
  const mismatch = confirm.length > 0 && confirm !== passphrase;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (tooShort || passphrase !== confirm || !saved) return;
    setBusy(true);
    setError(null);
    try {
      const record = await createKeyRecord(passphrase);
      await saveKeyRecord(record);
      onDone(record);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass mt-8 flex max-w-xl flex-col gap-5 rounded-3xl p-8 motion-safe:animate-rise">
      <div>
        <h2 className="text-xl font-bold">סיסמה ליומן</h2>
        <p className="mt-2 text-eggshell/75">
          מה שתכתוב ביומן יוצפן במחשב שלך לפני שהוא נשמר. רק הסיסמה הזו פותחת אותו. לכתוב אפשר גם בלעדיה.
        </p>
        <p className="mt-3 rounded-xl border border-rust-light/40 bg-rust/15 p-3 text-sm">
          אם תשכח את הסיסמה, אין דרך לשחזר את מה שכתבת. אף אחד לא יכול, גם לא אני. שמור אותה במנהל הסיסמאות.
        </p>
      </div>

      <div>
        <label htmlFor="passphrase" className="text-sm text-eggshell/75">
          סיסמה (לפחות {MIN_LENGTH} תווים)
        </label>
        <input
          id="passphrase"
          type="password"
          autoComplete="new-password"
          dir="ltr"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className={field}
        />
      </div>

      <div>
        <label htmlFor="confirm" className="text-sm text-eggshell/75">
          שוב, לאימות
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          dir="ltr"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={field}
        />
        {mismatch && <p className="mt-1.5 text-sm text-rust-light">הסיסמאות לא זהות</p>}
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="size-5 accent-eggshell" />
        <span>שמרתי את הסיסמה במקום בטוח</span>
      </label>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={busy || tooShort || passphrase !== confirm || !saved} className={primaryButton}>
          {busy ? "יוצר מפתחות..." : "לנעול את היומן"}
        </button>
        {error && <p className="text-sm text-rust-light">{error}</p>}
      </div>
    </form>
  );
}