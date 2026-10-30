import { describe, expect, it } from 'vitest';
import { describeSchedule, fieldSummary, humanList, monthName, weekdayName } from './describe';
import { describeCron, parseCron } from './logic';

const say = (expr: string, locale: 'es' | 'en' | 'pt' = 'es') =>
  describeSchedule(describeCron(parseCron(expr)), locale);

describe('describeSchedule', () => {
  it.each([
    ['* * * * *', 'Cada minuto.'],
    ['*/5 * * * *', 'Cada 5 minutos.'],
    ['7 * * * *', 'En el minuto 7 de cada hora.'],
    ['0 */6 * * *', 'En el minuto 0, cada 6 horas.'],
    ['0 9 * * 1-5', 'A las 09:00, de lunes a viernes.'],
    ['30 2 * * 0', 'A las 02:30, cada domingo.'],
    ['0 0 1 * *', 'A las 00:00, el día 1 del mes.'],
    ['15 8-18 * * *', 'En el minuto 15 de las horas 8 a 18.'],
    ['*/10 9,10 * * *', 'Cada 10 minutos, durante las horas 9 y 10.'],
    ['* 22 * * *', 'Cada minuto durante las horas 22.'],
    ['1-3 * * * *', 'En los minutos 1 a 3 de cada hora.'],
    ['1,2 1-4 * * *', 'En los minutos 1 y 2, horas 1 a 4.'],
    ['0 0 */2 * *', 'A las 00:00, cada 2 días del mes.'],
    ['0 12 13 * 5', 'A las 12:00, el día 13 del mes o cada viernes.'],
    ['0 0 1 1,7 *', 'A las 00:00, el día 1 del mes, en enero y julio.'],
    ['0 9 * * 1,3,5', 'A las 09:00, cada lunes, miércoles y viernes.'],
  ])('%s → %s', (expr, text) => {
    expect(say(expr)).toBe(text);
  });

  it('en inglés y portugués', () => {
    expect(say('0 9 * * 1-5', 'en')).toBe('At 09:00, Monday through Friday.');
    expect(say('0 9,17 * * *', 'en')).toBe('At 09:00 and 17:00.');
    expect(say('0 9 * * 1-5', 'pt')).toBe('Às 09:00, de segunda-feira a sexta-feira.');
  });
});

describe('helpers', () => {
  it('humanList agrupa tramos de 3 o más', () => {
    expect(humanList([5, 1, 2, 7, 8, 9], 'es')).toBe('1, 2, 5 y 7 a 9');
    expect(humanList([1], 'en')).toBe('1');
  });

  it('nombres de meses y días', () => {
    expect(monthName(1, 'es')).toBe('enero');
    expect(monthName(12, 'en', 'short')).toBe('Dec');
    expect(weekdayName(0, 'es')).toBe('domingo');
    expect(weekdayName(6, 'pt')).toBe('sábado');
  });

  it('fieldSummary', () => {
    const c = parseCron('*/20 9 * jan-mar mon,wed,fri');
    expect(fieldSummary('minute', '*/20', c.minute, 'en')).toBe('0, 20, and 40');
    expect(fieldSummary('dayOfMonth', '*', c.dayOfMonth, 'es')).toBe('todos');
    expect(fieldSummary('month', 'jan-mar', c.month, 'en')).toBe('Jan to Mar');
    expect(fieldSummary('dayOfWeek', 'mon,wed,fri', c.dayOfWeek, 'en')).toBe('Mon, Wed, and Fri');
  });
});
