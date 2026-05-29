export type ParsedStatValue = {
  numeric: number | null;
  prefix: string;
  suffix: string;
  decimals: number;
};

/** Parses homepage stats like "2000+", "50+", or plain "1,234". */
export function parseStatValue(value: string): ParsedStatValue {
  const trimmed = value.trim();
  const match = trimmed.match(/^([^0-9]*)([0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/);

  if (!match) {
    return { numeric: null, prefix: '', suffix: '', decimals: 0 };
  }

  const numStr = match[2].replace(/,/g, '');
  const numeric = Number(numStr);
  if (Number.isNaN(numeric)) {
    return { numeric: null, prefix: '', suffix: '', decimals: 0 };
  }

  const decimals = numStr.includes('.')
    ? (numStr.split('.')[1]?.length ?? 0)
    : 0;

  return {
    numeric,
    prefix: match[1],
    suffix: match[3],
    decimals,
  };
}

export function formatCountedStat(
  value: number,
  parsed: ParsedStatValue,
): string {
  const rounded =
    parsed.decimals > 0
      ? value.toFixed(parsed.decimals)
      : String(Math.round(value));
  const withCommas = rounded.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${parsed.prefix}${withCommas}${parsed.suffix}`;
}
