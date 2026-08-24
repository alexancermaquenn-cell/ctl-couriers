// Supported document currencies. EUR is the default. Symbol is placed BEFORE the
// amount consistently ("€ 12,000.00", "CHF 12,000.00", "$ 12,000.00", "£ 12,000.00").
export interface Currency {
  code: string;
  symbol: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'EUR', symbol: '€' },
  { code: 'CHF', symbol: 'CHF' },
  { code: 'USD', symbol: '$' },
  { code: 'GBP', symbol: '£' },
];

const DEFAULT_CODE = 'EUR';

/** Symbol for a currency code (falls back to the EUR symbol for unknown codes). */
export function currencySymbol(code?: string): string {
  const c = CURRENCIES.find((x) => x.code === (code ?? DEFAULT_CODE));
  return (c ?? CURRENCIES[0]).symbol;
}

/** Amount formatted "en-GB" with two decimals, symbol before: e.g. "€ 12,000.00". */
export function formatMoney(amount: number, code?: string): string {
  const v = Number.isFinite(amount) ? amount : 0;
  const body = v.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currencySymbol(code)} ${body}`;
}

/** Bare number, two decimals, no symbol (for columns that carry the code separately). */
export function formatAmount(amount: number): string {
  const v = Number.isFinite(amount) ? amount : 0;
  return v.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
