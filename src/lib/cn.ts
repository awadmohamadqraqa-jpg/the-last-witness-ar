/** Tiny classname joiner — keeps JSX readable without another dependency. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
