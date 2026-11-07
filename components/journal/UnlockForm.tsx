"use client";

import { useState } from "react";
import { WrongPassphraseError } from "@/lib/crypto";
import { field } from "./styles";

type Props = {
  onUnlock: (passphrase: string) => Promise<void>;
  onCancel: () => void;
};

// שדה סיסמה קטן, לפתיחת הטקסט הנעול.
// זה div ולא form, כי הוא יושב בתוך הטופס של היומן, ו-HTML לא מרשה טופס בתוך טופס.
export default function UnlockForm({ onUnlock, onCancel }: Props) {
  const [passphrase, setPassphrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (busy || passphrase === "") return;
    setBusy(true);
    setError(null);
    try {
      await onUnlock(passphrase);
    } catch (caught) {
      setError(caught instanceof WrongPassphraseError ? caught.message : "לא הצלחתי לפתוח. נסה שוב.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-4 flex max-w-sm flex-col gap-3 text-start">
      <label htmlFor="unlock" className="text-sm text-eggshell/75">
        סיסמת היומן
      </label>
      <input
        id="unlock"
        type="password"
        autoComplete="current-password"
        dir="ltr"
        autoFocus
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
        onKeyDown={(e) => {
          // Enter פותח את היומן, ולא שולח את הטופס הגדול
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        className={field}
      />
      {error && (
        <p role="alert" className="text-sm text-rust-light">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={busy || passphrase === ""}
          className="h-11 flex-1 rounded-full bg-eggshell font-semibold text-ink transition hover:bg-white disabled:opacity-60"
        >
          {busy ? "פותח..." : "לפתוח"}
        </button>
        <button type="button" onClick={onCancel} className="h-11 rounded-full border border-eggshell/30 px-5 transition hover:bg-eggshell/10">
          ביטול
        </button>
      </div>
    </div>
  );
}