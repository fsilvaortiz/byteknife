/** Año y número de semana ISO 8601 (en UTC). */
export function isoWeek(d: Date): [year: number, week: number] {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = Date.UTC(t.getUTCFullYear(), 0, 1);
  return [t.getUTCFullYear(), Math.ceil(((t.getTime() - y0) / 86_400_000 + 1) / 7)];
}

/** Día del año (1–366) en la zona horaria local. */
export function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getFullYear(), 0, 1);
  const today = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((today - start) / 86_400_000) + 1;
}

export const unixSeconds = (d: Date) => Math.floor(d.getTime() / 1000);
export const isoUtc = (d: Date) => d.toISOString().replace(/\.\d+Z$/, 'Z');
