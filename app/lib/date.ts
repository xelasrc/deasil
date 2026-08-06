// Puzzles are generated and dated on NZ time (see scripts/lib/puzzle-generation.ts),
// so "today" here must use the same clock rather than the player's browser
// timezone — otherwise streaks, "played today", and the archive's "today"
// marker drift out of sync with which puzzle is actually live.
export function getToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Pacific/Auckland",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}