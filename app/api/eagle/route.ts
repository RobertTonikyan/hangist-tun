import { createClient } from "@supabase/supabase-js";
import type { AlpacaPosition, AlpacaSummary } from "@/lib/types";

// הקובץ הזה רץ רק בשרת של הפאנל. המפתחות של Alpaca לא מגיעים לדפדפן אף פעם.

const paper = process.env.ALPACA_PAPER !== "false";
const ALPACA_BASE = paper ? "https://paper-api.alpaca.markets" : "https://api.alpaca.markets";

type AlpacaAccount = { equity: string; last_equity: string; cash: string; buying_power: string };
type AlpacaRawPosition = {
  symbol: string;
  qty: string;
  avg_entry_price: string;
  current_price: string;
  market_value: string;
  unrealized_pl: string;
  unrealized_plpc: string;
};
type AlpacaHistory = { timestamp: number[] | null; equity: (number | null)[] | null };

function fail(status: number, error: string) {
  return Response.json({ error }, { status });
}

async function alpaca<T>(path: string, keyId: string, secret: string): Promise<T> {
  const response = await fetch(ALPACA_BASE + path, {
    headers: { "APCA-API-KEY-ID": keyId, "APCA-API-SECRET-KEY": secret },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Alpaca ${path}: ${response.status} ${await response.text()}`);
  return (await response.json()) as T;
}

export async function GET(request: Request) {
  // 1. מי שואל? הדפדפן שולח את הטוקן של Supabase, ואנחנו בודקים אותו.
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return fail(401, "לא מחובר");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return fail(500, "Missing Supabase variables in .env.local");

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return fail(401, "לא מחובר");

  // 2. רק אתה. גם משתמש מחובר אחר לא יקבל את נתוני החשבון.
  if (data.user.id !== process.env.PANEL_OWNER_ID) return fail(403, "אין הרשאה");

  const keyId = process.env.ALPACA_API_KEY;
  const secret = process.env.ALPACA_SECRET_KEY;
  if (!keyId || !secret) return fail(500, "חסרים ALPACA_API_KEY ו-ALPACA_SECRET_KEY ב-.env.local");

  // 3. שלוש בקשות ל-Alpaca, במקביל
  try {
    const [account, positions, history] = await Promise.all([
      alpaca<AlpacaAccount>("/v2/account", keyId, secret),
      alpaca<AlpacaRawPosition[]>("/v2/positions", keyId, secret),
      alpaca<AlpacaHistory>("/v2/account/portfolio/history?period=1M&timeframe=1D", keyId, secret),
    ]);

    const summary: AlpacaSummary = {
      paper,
      equity: Number(account.equity),
      lastEquity: Number(account.last_equity),
      cash: Number(account.cash),
      buyingPower: Number(account.buying_power),
      positions: positions.map(
        (p): AlpacaPosition => ({
          symbol: p.symbol,
          qty: Number(p.qty),
          avgEntry: Number(p.avg_entry_price),
          current: Number(p.current_price),
          marketValue: Number(p.market_value),
          unrealizedPl: Number(p.unrealized_pl),
          unrealizedPlPct: Number(p.unrealized_plpc) * 100,
        }),
      ),
      history: (history.timestamp ?? [])
        .map((seconds, i) => ({
          date: new Date(seconds * 1000).toISOString().slice(0, 10),
          equity: history.equity?.[i] ?? null,
        }))
        .filter((point): point is { date: string; equity: number } => point.equity !== null && point.equity > 0),
    };

    return Response.json(summary);
  } catch (caught) {
    return fail(502, caught instanceof Error ? caught.message : String(caught));
  }
}