import { describe, expect, it } from 'vitest';
import {
  BLACK,
  composite,
  contrast,
  formats,
  isColor,
  oklchFit,
  oklchScale,
  parseColor,
  rgbToHsl,
  rgbToOklch,
  toHex,
  wcagGrade,
  WHITE,
  type RGBA,
} from './logic';

const rgb = (r: number, g: number, b: number, a = 1): RGBA => ({ r, g, b, a });

describe('parseColor', () => {
  it.each([
    ['#2a4fd6', rgb(42, 79, 214)],
    ['2A4FD6', rgb(42, 79, 214)],
    ['#abc', rgb(170, 187, 204)],
    ['#abc8', rgb(170, 187, 204, 0.533)],
    ['#2a4fd680', rgb(42, 79, 214, 0.502)],
    ['rgb(42 79 214)', rgb(42, 79, 214)],
    ['rgb(42, 79, 214)', rgb(42, 79, 214)],
    ['rgba(42, 79, 214, 0.5)', rgb(42, 79, 214, 0.5)],
    ['rgb(42 79 214 / 50%)', rgb(42, 79, 214, 0.5)],
    ['rgb(100% 0% 50%)', rgb(255, 0, 128)],
    ['rgb(300 -5 0)', rgb(255, 0, 0)],
    ['hsl(0 100% 50%)', rgb(255, 0, 0)],
    ['hsl(120deg, 100%, 25%)', rgb(0, 128, 0)],
    ['hsla(0.5turn 100% 50% / .25)', rgb(0, 255, 255, 0.25)],
    ['hsl(-120 100% 50%)', rgb(0, 0, 255)],
    ['hsl(480 100% 50%)', rgb(0, 255, 0)],
    ['hsl(3.14159rad 100% 50%)', rgb(0, 255, 255)],
    ['hsl(200grad 100% 50%)', rgb(0, 255, 255)],
    ['oklch(62.8% 0.2577 29.23)', rgb(255, 0, 0)],
    ['oklch(0.628 64.4% 29.23)', rgb(255, 0, 0)],
    ['oklch(100% 0 none)', rgb(255, 255, 255)],
    ['OKLCH(0% 0 0 / 0)', rgb(0, 0, 0, 0)],
  ])('%s', (s, expected) => {
    expect(parseColor(s)).toEqual(expected);
  });

  it('OKLCH fuera de gama se ajusta reduciendo el croma', () => {
    const c = parseColor('oklch(70% 0.4 150)')!;
    expect([c.r, c.g, c.b].every((x) => x >= 0 && x <= 255)).toBe(true);
    expect(rgbToOklch(c).h).toBeCloseTo(150, 0);
  });

  it.each([
    'tomato',
    '#ab',
    '#abcde',
    'rgb(1 2)',
    'rgb(1 2 3 4 5)',
    'rgb(1 2 3 / 4 / 5)',
    'rgb(a b c)',
    'rgb(1 2 3 / x)',
    'lab(50% 20 30)',
    '',
  ])('null con %s', (s) => {
    expect(parseColor(s)).toBeNull();
  });
});

describe('conversiones', () => {
  it('HEX con y sin alfa', () => {
    expect(toHex(rgb(42, 79, 214))).toBe('#2a4fd6');
    expect(toHex(rgb(42, 79, 214, 0.5))).toBe('#2a4fd680');
  });

  it('HSL', () => {
    expect(rgbToHsl(rgb(42, 79, 214))).toEqual({ h: 227, s: 68, l: 50 });
    expect(rgbToHsl(rgb(128, 128, 128))).toEqual({ h: 0, s: 0, l: 50 });
    expect(rgbToHsl(rgb(0, 255, 0))).toEqual({ h: 120, s: 100, l: 50 });
    expect(rgbToHsl(rgb(255, 0, 128)).h).toBe(330);
    expect(rgbToHsl(rgb(250, 250, 255)).s).toBe(100);
  });

  it('formatos del ejemplo', () => {
    expect(Object.fromEntries(formats(rgb(42, 79, 214)))).toEqual({
      hex: '#2a4fd6',
      rgb: 'rgb(42 79 214)',
      hsl: 'hsl(227 68% 50%)',
      // Coincide con Chromium: oklch(from #2a4fd6 l c h) = oklch(0.492175 0.210721 266.378)
      oklch: 'oklch(49.2% 0.211 266.4)',
      tailwind: 'bg-[#2a4fd6]',
      cssVar: '--color-brand: #2a4fd6;',
    });
  });

  it('grises usan «none» como tono y el alfa se escribe con /', () => {
    const f = Object.fromEntries(formats(rgb(128, 128, 128, 0.5)));
    expect(f['oklch']).toMatch(/ none \/ 0\.5\)$/);
    expect(f['rgb']).toBe('rgb(128 128 128 / 0.5)');
  });
});

describe('contraste', () => {
  it('blanco sobre negro es 21:1 y el ejemplo pasa AA sobre blanco', () => {
    expect(contrast(WHITE, BLACK)).toBeCloseTo(21, 5);
    const c = contrast(rgb(42, 79, 214), WHITE);
    expect(c).toBeCloseTo(6.59, 2);
    expect(wcagGrade(c)).toBe('aa');
  });

  it('un color translúcido se compone sobre el fondo', () => {
    expect(composite(rgb(0, 0, 0, 0.5), WHITE)).toEqual(rgb(128, 128, 128));
    expect(contrast(rgb(0, 0, 0, 0), WHITE)).toBeCloseTo(1, 5);
  });

  it.each([
    [7, 'aaa'],
    [4.5, 'aa'],
    [3, 'aaLarge'],
    [2.99, 'fail'],
  ] as const)('%d → %s', (ratio, grade) => {
    expect(wcagGrade(ratio)).toBe(grade);
  });
});

describe('oklchScale', () => {
  it('10 tonos de claro a oscuro y en gama', () => {
    const scale = oklchScale(rgb(42, 79, 214));
    expect(scale.map((s) => s.step)).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900]);
    const L = scale.map((s) => rgbToOklch(parseColor(s.hex)!).L);
    expect([...L].sort((a, b) => b - a)).toEqual(L);
    // El texto elegido (blanco o negro) siempre cumple AA sobre cada tono.
    for (const s of scale) {
      const tone = parseColor(s.hex)!;
      expect(contrast(s.dark ? WHITE : BLACK, tone)).toBeGreaterThanOrEqual(4.5);
    }
    expect(scale[0]!.dark).toBe(false);
    expect(scale[9]!.dark).toBe(true);
  });

  it('el texto cumple AA en escalas de cualquier matiz', () => {
    for (const hex of ['#ff0000', '#00ff00', '#ffff00', '#00ffff', '#808080', '#436ff8']) {
      for (const s of oklchScale(parseColor(hex)!)) {
        expect(contrast(s.dark ? WHITE : BLACK, parseColor(s.hex)!)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('oklchFit de un color dentro de gama no lo cambia', () => {
    const ok = rgbToOklch(rgb(42, 79, 214));
    expect(oklchFit(ok.L, ok.C, ok.h)).toEqual([42, 79, 214]);
  });
});

describe('isColor', () => {
  it.each([
    ['#2a4fd6', true],
    ['rgb(1 2 3)', true],
    ['lab(50% 20 30)', true],
    ['2a4fd6', false],
    ['tomato', false],
  ])('%s → %s', (s, r) => {
    expect(isColor(s)).toBe(r);
  });
});
