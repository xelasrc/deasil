export function getToday(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  const local = new Date(now.getTime() - offset);
  return local.toISOString().split("T")[0];
}