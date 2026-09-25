/** Whole years between an ISO date and `now`, counting the anniversary day itself. */
export function yearsSince(iso: string, now: Date): number {
  const [year, month, day] = iso.split('-').map(Number);
  const beforeAnniversary =
    now.getMonth() + 1 < month || (now.getMonth() + 1 === month && now.getDate() < day);
  return now.getFullYear() - year - (beforeAnniversary ? 1 : 0);
}
