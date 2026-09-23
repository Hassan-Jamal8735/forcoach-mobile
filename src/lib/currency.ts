import { useAuth } from "../context/AuthContext";

const SYMBOLS: Record<string, string> = { EUR: "€", USD: "$", GBP: "£" };

export function useCurrency() {
  const { session } = useAuth();
  const code = (session?.user.user_metadata?.currency as string | undefined) ?? "EUR";
  const symbol = SYMBOLS[code] ?? "€";
  const format = (amount: number, decimals = 2) =>
    `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  return { code, symbol, format };
}
