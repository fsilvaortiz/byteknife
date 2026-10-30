import { describe, expect, it } from 'vitest';
import { CronError, isCronExpression, parseCron } from './logic';

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
