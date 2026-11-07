import type { Sealed } from "./types";

// הצפנה בצד הדפדפן, עם Web Crypto המובנה. שום טקסט גלוי לא יוצא מהמחשב.
//
// שני מפתחות (RSA-OAEP):
//   ציבורי  - שמור במסד בגלוי. איתו מצפינים. לא צריך סיסמה כדי לכתוב.
//   פרטי    - שמור במסד מוצפן בסיסמה שלך. רק איתו מפענחים.
//
// כל רשומה מוצפנת במפתח AES חד-פעמי, ואת המפתח הזה עוטפים במפתח הציבורי.

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// כמה פעמים מערבלים את הסיסמה. ככה ניחוש סיסמאות בכוח איטי מאוד.
const PBKDF2_ITERATIONS = 600_000;

const RSA_PARAMS: RsaHashedKeyGenParams = {
  name: "RSA-OAEP",
  modulusLength: 3072,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: "SHA-256",
};

const RSA_IMPORT = { name: "RSA-OAEP", hash: "SHA-256" };

export type KeyRecord = {
  publicKey: string;
  encryptedPrivateKey: string;
  salt: string;
  iv: string;
};

export class WrongPassphraseError extends Error {
  constructor() {
    super("הסיסמה לא נכונה");
  }
}

// בינארי ⇄ טקסט, כדי שאפשר יהיה לשמור בעמודת text במסד
export function toBase64(bytes: ArrayBuffer | Uint8Array) {
  const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of array) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function fromBase64(text: string) {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// מהסיסמה שלך מייצרים מפתח AES, שנועל ופותח את המפתח הפרטי
async function keyFromPassphrase(passphrase: string, salt: Uint8Array<ArrayBuffer>) {
  const base = await crypto.subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// פעם אחת, כשבוחרים סיסמה: יוצרים את זוג המפתחות, ונועלים את הפרטי בסיסמה
export async function createKeyRecord(passphrase: string): Promise<KeyRecord> {
  const pair = await crypto.subtle.generateKey(RSA_PARAMS, true, ["encrypt", "decrypt"]);
  const publicKey = await crypto.subtle.exportKey("spki", pair.publicKey);
  const privateKey = await crypto.subtle.exportKey("pkcs8", pair.privateKey);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const lock = await keyFromPassphrase(passphrase, salt);
  const encryptedPrivateKey = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, lock, privateKey);

  return {
    publicKey: toBase64(publicKey),
    encryptedPrivateKey: toBase64(encryptedPrivateKey),
    salt: toBase64(salt),
    iv: toBase64(iv),
  };
}

// פותח את המפתח הפרטי עם הסיסמה. סיסמה שגויה זורקת WrongPassphraseError.
export async function unlockPrivateKey(record: KeyRecord, passphrase: string): Promise<CryptoKey> {
  const lock = await keyFromPassphrase(passphrase, fromBase64(record.salt));
  let pkcs8: ArrayBuffer;
  try {
    pkcs8 = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(record.iv) }, lock, fromBase64(record.encryptedPrivateKey));
  } catch {
    // AES-GCM בודק שהתוכן לא שונה. מפתח לא נכון = הבדיקה נכשלת.
    throw new WrongPassphraseError();
  }
  return crypto.subtle.importKey("pkcs8", pkcs8, RSA_IMPORT, false, ["decrypt"]);
}

// מצפין ערך כלשהו עם המפתח הציבורי. לא צריך סיסמה.
export async function seal(publicKey: string, value: unknown): Promise<Sealed> {
  const rsa = await crypto.subtle.importKey("spki", fromBase64(publicKey), RSA_IMPORT, false, ["encrypt"]);
  const dataKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, dataKey, encoder.encode(JSON.stringify(value)));
  const rawKey = await crypto.subtle.exportKey("raw", dataKey);
  const wrappedKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, rsa, rawKey);

  return { ciphertext: toBase64(ciphertext), iv: toBase64(iv), wrappedKey: toBase64(wrappedKey) };
}

// מפענח עם המפתח הפרטי (אחרי שנפתח בסיסמה)
export async function unseal<T>(privateKey: CryptoKey, sealed: Sealed): Promise<T> {
  const rawKey = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, fromBase64(sealed.wrappedKey));
  const dataKey = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["decrypt"]);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(sealed.iv) }, dataKey, fromBase64(sealed.ciphertext));
  return JSON.parse(decoder.decode(plain)) as T;
}