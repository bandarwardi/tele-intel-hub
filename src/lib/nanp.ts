import { AREA_CODES, AREA_CODE_MAP, carrierFor, type AreaCode } from "@/data/areaCodes";

export type InputKind = "areacode" | "phone" | "city" | "region" | "unknown";

export interface LookupResult {
  kind: InputKind;
  query: string;
  normalizedPhone?: string;
  e164?: string;
  matches: AreaCode[];
}

const DIGITS = /\D+/g;

export function detectInput(raw: string): InputKind {
  const q = raw.trim();
  if (!q) return "unknown";
  const digits = q.replace(DIGITS, "");
  if (digits.length >= 7 && /^[\d\s()+.-]+$/.test(q)) return "phone";
  if (digits.length === 3 && /^\+?\d{3}$/.test(q.replace(/[\s()-]/g, ""))) return "areacode";
  const lower = q.toLowerCase();
  if (
    AREA_CODES.some(
      (a) => a.regionName.toLowerCase() === lower || a.region.toLowerCase() === lower,
    )
  )
    return "region";
  return "city";
}

export function formatUS(digits: string): string {
  const d = digits.replace(DIGITS, "").replace(/^1(?=\d{10}$)/, "");
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return digits;
}

export function toE164(digits: string): string {
  const d = digits.replace(DIGITS, "").replace(/^1(?=\d{10}$)/, "");
  return d.length === 10 ? `+1${d}` : d ? `+${d}` : "";
}

export function isValidNanp(raw: string): boolean {
  const d = raw.replace(DIGITS, "").replace(/^1(?=\d{10}$)/, "");
  if (d.length !== 10) return false;
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(d);
}

export function lookup(raw: string): LookupResult {
  const query = raw.trim();
  const kind = detectInput(query);
  if (!query) return { kind: "unknown", query, matches: [] };

  if (kind === "phone") {
    const digits = query.replace(DIGITS, "").replace(/^1(?=\d{10}$)/, "");
    const npa = digits.slice(0, 3);
    return {
      kind,
      query,
      normalizedPhone: formatUS(digits),
      e164: toE164(digits),
      matches: digits.length >= 10 ? (AREA_CODE_MAP[npa] ?? []) : [],
    };
  }
  if (kind === "areacode") {
    const npa = query.replace(DIGITS, "");
    return { kind, query, matches: AREA_CODE_MAP[npa] ?? [] };
  }
  const lower = query.toLowerCase();
  if (kind === "region") {
    return {
      kind,
      query,
      matches: AREA_CODES.filter(
        (a) => a.regionName.toLowerCase() === lower || a.region.toLowerCase() === lower,
      ),
    };
  }
  return {
    kind: "city",
    query,
    matches: AREA_CODES.filter(
      (a) =>
        a.cities.some((c) => c.toLowerCase().includes(lower)) ||
        a.regionName.toLowerCase().includes(lower),
    ).slice(0, 40),
  };
}

export { carrierFor };

export interface LocalTime {
  time: string;
  date: string;
  hour: number;
  minute: number;
  offset: string;
}

export function localTime(timezone: string, now: Date = new Date()): LocalTime {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const offset =
    new Intl.DateTimeFormat("en-US", { timeZone: timezone, timeZoneName: "shortOffset" })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value ?? "";
  return { time: fmt.format(now), date: dateFmt.format(now), hour, minute, offset };
}

export type CallStatus = "good" | "caution" | "blocked";

export interface CallWindow {
  status: CallStatus;
  label: string;
  detail: string;
}

/** FCC/TCPA telemarketing window is 8AM–9PM local; courteous window is 9AM–8PM. */
export function callingWindow(hour: number): CallWindow {
  if (hour >= 9 && hour < 20)
    return {
      status: "good",
      label: "Safe to call",
      detail: "Inside the courteous 9:00 AM – 8:00 PM local window.",
    };
  if ((hour >= 8 && hour < 9) || (hour >= 20 && hour < 21))
    return {
      status: "caution",
      label: "Borderline",
      detail: "Legal under TCPA (8 AM – 9 PM) but outside the courteous window.",
    };
  return {
    status: "blocked",
    label: "Do not call",
    detail: "Outside the TCPA 8:00 AM – 9:00 PM local calling window.",
  };
}

export function mapLink(a: AreaCode): string {
  const q = encodeURIComponent(`${a.cities[0]}, ${a.regionName}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
