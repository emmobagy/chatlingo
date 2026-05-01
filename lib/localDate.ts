// Returns YYYY-MM-DD in the user's local timezone (not UTC).
// Use this everywhere we compare or store dates for per-user daily stats.
export function localDateStr(date: Date = new Date()): string {
  return date.toLocaleDateString('en-CA'); // en-CA always formats as YYYY-MM-DD
}
