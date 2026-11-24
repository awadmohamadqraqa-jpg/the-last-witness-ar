export const ar = (n: number | string): string => String(n)

/** Arabic-Indic digits for terminal-style counters (kept consistent everywhere). */
const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

export function toArabicDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => AR_DIGITS[Number(d)])
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`
}

export function formatDurationMs(ms: number): string {
  return formatClock(Math.round(ms / 1000))
}
