import { describe, expect, it } from 'vitest';
import { CronError, isCronExpression, parseCron, describeCron, nextRuns } from './logic';

const sorted = (s: Set<number>) => [...s].sort((a, b) => a - b);

describe('parseCron', () => {
  it('interpreta comodines, rangos, listas y pasos', () => {
    const c = parseCron('*/15 9-17 1,15 * 1-5');
    expect(sorted(c.minute)).toEqual([0, 15, 30, 45]);
    expect(sorted(c.hour)).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17]);
    expect(sorted(c.dayOfMonth)).toEqual([1, 15]);
    expect(c.month.size).toBe(12);
    expect(sorted(c.dayOfWeek)).toEqual([1, 2, 3, 4, 5]);
  });

  it('acepta nombres de mes y de día sin distinguir mayúsculas', () => {
    const c = parseCron('0 0 * jan-mar MON,fri');
    expect(sorted(c.month)).toEqual([1, 2, 3]);
    expect(sorted(c.dayOfWeek)).toEqual([1, 5]);
  });

  it('trata el 7 como domingo', () => {
    expect(sorted(parseCron('0 0 * * 7').dayOfWeek)).toEqual([0]);
  });

  it('un valor con paso va hasta el máximo', () => {
    expect(sorted(parseCron('5/20 * * * *').minute)).toEqual([5, 25, 45]);
  });

  it('expande macros', () => {
    expect(parseCron('@daily').raw).toEqual(['0', '0', '*', '*', '*']);
    expect(parseCron('@HOURLY').raw).toEqual(['0', '*', '*', '*', '*']);
  });

  it.each([
    ['* * * *', 'fieldCount'],
    ['60 * * * *', 'outOfRange'],
    ['* * 0 * *', 'outOfRange'],
    ['x * * * *', 'invalidValue'],
    ['*/0 * * * *', 'invalidStep'],
    ['*/a * * * *', 'invalidStep'],
    ['10-5 * * * *', 'invertedRange'],
  ])('«%s» lanza %s', (expr, code) => {
    expect(() => parseCron(expr)).toThrow(CronError);
    try {
      parseCron(expr);
    } catch (e) {
      expect((e as CronError).code).toBe(code);
    }
  });

  it('indica el campo y los límites en el error de rango', () => {
    try {
      parseCron('* 24 * * *');
      expect.unreachable();
    } catch (e) {
      expect((e as CronError).params).toEqual({ field: 'hour', value: 24, min: 0, max: 23 });
    }
  });
});

describe('isCronExpression', () => {
  it.each(['0 9 * * 1-5', '*/5 * * * *', '@weekly', '30 2 1 */2 *'])('detecta %s', (s) => {
    expect(isCronExpression(s)).toBe(true);
  });

  it.each([
    ['sin comodín ni paso', '1 2 3 4 5'],
    ['cuatro campos', '* * * *'],
    ['valor fuera de rango', '0 25 * * *'],
    ['texto normal', 'hola que tal amigo mío'],
    ['macro desconocida', '@sometimes'],
  ])('rechaza %s', (_, s) => {
    expect(isCronExpression(s)).toBe(false);
  });
});

describe('nextRuns', () => {
  // Fechas locales: el test pasa en cualquier zona horaria.
  const from = new Date(2026, 9, 30, 9, 30); // viernes 30-10-2026 09:30

  it('días laborales a las 9:00', () => {
    const runs = nextRuns(parseCron('0 9 * * 1-5'), from, 3);
    expect(runs).toEqual([
      new Date(2026, 10, 2, 9, 0),
      new Date(2026, 10, 3, 9, 0),
      new Date(2026, 10, 4, 9, 0),
    ]);
  });

  it('cada 15 minutos empieza en el siguiente múltiplo', () => {
    expect(nextRuns(parseCron('*/15 * * * *'), from, 2)).toEqual([
      new Date(2026, 9, 30, 9, 45),
      new Date(2026, 9, 30, 10, 0),
    ]);
  });

  it('no incluye el minuto actual', () => {
    expect(nextRuns(parseCron('30 9 * * *'), from, 1)).toEqual([new Date(2026, 9, 31, 9, 30)]);
  });

  it('día del mes O día de la semana cuando ambos están restringidos', () => {
    const runs = nextRuns(parseCron('0 0 1 * 0'), from, 3);
    expect(runs).toEqual([
      new Date(2026, 10, 1, 0, 0), // domingo 1
      new Date(2026, 10, 8, 0, 0), // domingo
      new Date(2026, 10, 15, 0, 0),
    ]);
  });

  it('solo día de la semana y salto de mes', () => {
    expect(nextRuns(parseCron('0 12 * 2 sat'), from, 1)).toEqual([new Date(2027, 1, 6, 12, 0)]);
  });

  it('29 de febrero salta al próximo año bisiesto', () => {
    expect(nextRuns(parseCron('0 0 29 2 *'), from, 1)).toEqual([new Date(2028, 1, 29, 0, 0)]);
  });

  it('31 de febrero nunca ocurre', () => {
    expect(nextRuns(parseCron('0 0 31 2 *'), from, 5)).toEqual([]);
  });
});

describe('describeCron', () => {
  const d = (e: string) => describeCron(parseCron(e));

  it.each([
    ['* * * * *', { kind: 'everyMinute' }],
    ['*/5 * * * *', { kind: 'everyNMinutes', n: 5 }],
    ['7 * * * *', { kind: 'minuteOfHour', minute: 7 }],
    ['0 */6 * * *', { kind: 'minuteEveryNHours', minute: 0, n: 6 }],
    ['0,30 9,17 * * *', { kind: 'at', times: [540, 570, 1020, 1050] }],
    [
      '15 8-18 * * *',
      { kind: 'minuteAtHours', minute: 15, hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
    ],
    ['*/10 9,10 * * *', { kind: 'everyNMinutesAtHours', n: 10, hours: [9, 10] }],
    ['* 22 * * *', { kind: 'everyMinuteAtHours', hours: [22] }],
    ['1-3 * * * *', { kind: 'minutes', minutes: [1, 2, 3], hours: null }],
    ['1,2 1,2,3,4 * * *', { kind: 'minutes', minutes: [1, 2], hours: [1, 2, 3, 4] }],
  ])('%s', (expr, time) => {
    expect(d(expr).time).toEqual(time);
  });

  it('días, días de la semana y meses', () => {
    expect(d('0 0 1,15 jan,jul 7')).toMatchObject({
      days: { kind: 'list', days: [1, 15] },
      weekdays: [0],
      months: [1, 7],
    });
    expect(d('0 0 */2 * *').days).toEqual({ kind: 'everyNDays', n: 2 });
    expect(d('@daily')).toMatchObject({ days: null, weekdays: null, months: null });
  });
});
