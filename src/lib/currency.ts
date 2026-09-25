import { useAuth } from "../context/AuthContext";

// Keep in sync with web/src/lib/currency.ts.
export const CURRENCIES = [
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "AED", label: "UAE Dirham", symbol: "AED " },
  { code: "KWD", label: "Kuwaiti Dinar", symbol: "KWD " },
] as const;

export function currencySymbol(code: string) {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "€";
}

export function currencyLabel(code: string) {
  const c = CURRENCIES.find((x) => x.code === code);
  return c ? `${c.label} (${c.code})` : code;
}

export function useCurrency() {
  const { session } = useAuth();
  const code = (session?.user.user_metadata?.currency as string | undefined) ?? "EUR";
  const symbol = currencySymbol(code);
  // The Kuwaiti dinar uses 3 decimal places.
  const baseDecimals = code === "KWD" ? 3 : 2;
  const format = (amount: number, decimals = baseDecimals) =>
    `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  return { code, symbol, format };
}
