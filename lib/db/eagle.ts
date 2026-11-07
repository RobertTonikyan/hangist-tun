import { supabase } from "@/lib/supabase";
import type { EagleScore, EagleTrade } from "@/lib/types";

// הידיעות האחרונות שהבוט דירג. בלי שורות של "לא נמצאה מניה".
export async function loadScores(limit = 40): Promise<EagleScore[]> {
  const { data, error } = await supabase
    .from("eagle_scores")
    .select("id, ts, source, headline, url, symbol, score, reason, action, mode")
    .not("symbol", "is", null)
    .order("ts", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data as EagleScore[];
}

type TradeRow = Omit<EagleTrade, "stopPrice"> & { stop_price: number | null };

export async function loadTrades(limit = 20): Promise<EagleTrade[]> {
  const { data, error } = await supabase
    .from("eagle_trades")
    .select("id, ts, symbol, side, qty, price, stop_price, reason, mode")
    .order("ts", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as TradeRow[]).map(({ stop_price, ...row }) => ({ ...row, stopPrice: stop_price }));
}