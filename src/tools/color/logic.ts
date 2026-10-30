export { isColor } from './detect';

/** Color sRGB: canales 0–255 enteros y alfa 0–1. */
export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const round = (x: number, d = 0) => Math.round(x * 10 ** d) / 10 ** d;

interface Token {
  value: number;
  unit: '' | '%' | 'deg' | 'rad' | 'grad' | 'turn';
}

function token(s: string): Token | null {
  if (s.toLowerCase() === 'none') return { value: 0, unit: '' };
  const m = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(%|deg|rad|grad|turn)?$/i.exec(s);
  return m ? { value: Number(m[1]), unit: (m[2]?.toLowerCase() ?? '') as Token['unit'] } : null;
}

const toDegrees = ({ value, unit }: Token) =>
  unit === 'rad'
    ? (value * 180) / Math.PI
    : unit === 'grad'
      ? value * 0.9
      : unit === 'turn'
        ? value * 360
        : value;

/** Número o porcentaje a 0–1 (`scale` = valor que equivale a 100 %). */
const fraction = (t: Token, scale: number) => (t.unit === '%' ? t.value / 100 : t.value / scale);

function parseHex(s: string): RGBA | null {
  const m = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(s);
  if (!m) return null;
  let h = m[1]!;
  if (h.length <= 4) h = [...h].map((c) => c + c).join('');
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? round(n(6) / 255, 3) : 1 };
}

/** Separa los argumentos de una función de color, con comas o espacios y `/ alfa`. */
function args(inner: string): { main: Token[]; alpha: Token | null } | null {
  const [mainText = '', alphaText, extra] = inner.split('/');
  if (extra !== undefined) return null;
  const main = mainText
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(token);
  let alpha = alphaText !== undefined ? token(alphaText.trim()) : null;
  if (alphaText === undefined && main.length === 4) alpha = main.pop()!;
  if (main.length !== 3 || main.some((t) => !t) || (alphaText !== undefined && !alpha)) return null;
  return { main: main as Token[], alpha };
}

const alphaOf = (t: Token | null) => (t ? round(clamp(fraction(t, 1), 0, 1), 3) : 1);

/** Lee HEX, rgb()/rgba(), hsl()/hsla() y oklch(). Otros formatos CSS van por el navegador. */
export function parseColor(input: string): RGBA | null {
  const s = input.trim().toLowerCase();
  const hex = parseHex(s);
  if (hex) return hex;
  const fn = /^(rgba?|hsla?|oklch)\((.*)\)$/.exec(s);
  if (!fn) return null;
  const parsed = args(fn[2]!);
  if (!parsed) return null;
  const [x, y, z] = parsed.main as [Token, Token, Token];
  const a = alphaOf(parsed.alpha);
  if (fn[1]!.startsWith('rgb')) {
    const ch = (t: Token) =>
      Math.round(clamp(t.unit === '%' ? (t.value / 100) * 255 : t.value, 0, 255));
    return { r: ch(x), g: ch(y), b: ch(z), a };
  }
  if (fn[1]!.startsWith('hsl')) {
    const pct = (t: Token) => clamp(t.value, 0, 100) / 100;
    return { ...hslToRgb(toDegrees(x), pct(y), pct(z)), a };
  }
  const chroma = y.unit === '%' ? (y.value / 100) * 0.4 : y.value;
  const [r, g, b] = oklchFit(clamp(fraction(x, 1), 0, 1), Math.max(0, chroma), toDegrees(z));
  return { r, g, b, a };
}

function hslToRgb(h: number, s: number, l: number) {
  const f = (n: number) => {
    const k = (n + (((h % 360) + 360) % 360) / 30) % 12;
    return Math.round(255 * (l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return { r: f(0), g: f(8), b: f(4) };
}

export function rgbToHsl({ r, g, b }: RGBA): { h: number; s: number; l: number } {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === R ? (G - B) / d + (G < B ? 6 : 0) : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h) % 360, s: Math.round(s * 100), l: Math.round(l * 100) };
}

const toLinear = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) =>
  255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function rgbToOklch({ r, g, b }: RGBA): { L: number; C: number; h: number } {
  const [R, G, B] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const h = (Math.atan2(Bb, A) * 180) / Math.PI;
  return { L, C: Math.hypot(A, Bb), h: h < 0 ? h + 360 : h };
}

function oklchToLinear(L: number, C: number, h: number): [number, number, number] {
  const A = C * Math.cos((h * Math.PI) / 180);
  const B = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** OKLCH a sRGB; si cae fuera de gama, reduce el croma (búsqueda binaria) conservando L y h. */
export function oklchFit(L: number, C: number, h: number): [number, number, number] {
  const inGamut = (v: number[]) => v.every((x) => x >= -0.0005 && x <= 1.0005);
  let lin = oklchToLinear(L, C, h);
  if (!inGamut(lin)) {
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear(L, mid, h))) lo = mid;
      else hi = mid;
    }
    lin = oklchToLinear(L, lo, h);
  }
  return lin.map((v) => Math.round(clamp(fromLinear(clamp(v, 0, 1)), 0, 255))) as [
    number,
    number,
    number,
  ];
}

const hex2 = (n: number) => n.toString(16).padStart(2, '0');

export const toHex = (c: RGBA) =>
  `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}${c.a < 1 ? hex2(Math.round(c.a * 255)) : ''}`;

const alphaSuffix = (c: RGBA) => (c.a < 1 ? ` / ${c.a}` : '');

export type FormatId = 'hex' | 'rgb' | 'hsl' | 'oklch' | 'tailwind' | 'cssVar';

export function formats(c: RGBA): [FormatId, string][] {
  const hsl = rgbToHsl(c);
  const ok = rgbToOklch(c);
  // En los grises el tono no está definido: CSS lo escribe como «none».
  const hue = ok.C < 0.0005 ? 'none' : ok.h.toFixed(1);
  const hex = toHex(c);
  return [
    ['hex', hex],
    ['rgb', `rgb(${c.r} ${c.g} ${c.b}${alphaSuffix(c)})`],
    ['hsl', `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%${alphaSuffix(c)})`],
    ['oklch', `oklch(${(ok.L * 100).toFixed(1)}% ${ok.C.toFixed(3)} ${hue}${alphaSuffix(c)})`],
    ['tailwind', `bg-[${hex}]`],
    ['cssVar', `--color-brand: ${hex};`],
  ];
}

const luminance = ({ r, g, b }: RGBA) =>
  0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

/** Compone un color con transparencia sobre un fondo opaco. */
export const composite = (fg: RGBA, bg: RGBA): RGBA => ({
  r: Math.round(fg.r * fg.a + bg.r * (1 - fg.a)),
  g: Math.round(fg.g * fg.a + bg.g * (1 - fg.a)),
  b: Math.round(fg.b * fg.a + bg.b * (1 - fg.a)),
  a: 1,
});

/** Razón de contraste WCAG 2. Si el color es translúcido, se compone sobre el fondo. */
export function contrast(color: RGBA, bg: RGBA): number {
  const x = luminance(composite(color, bg));
  const y = luminance(bg);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

export type Grade = 'aaa' | 'aa' | 'aaLarge' | 'fail';

export const wcagGrade = (ratio: number): Grade =>
  ratio >= 7 ? 'aaa' : ratio >= 4.5 ? 'aa' : ratio >= 3 ? 'aaLarge' : 'fail';

export const WHITE: RGBA = { r: 255, g: 255, b: 255, a: 1 };
export const BLACK: RGBA = { r: 0, g: 0, b: 0, a: 1 };

const SCALE_L = [0.97, 0.93, 0.86, 0.77, 0.68, 0.59, 0.5, 0.42, 0.34, 0.26];
const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

/**
 * 10 tonos con el mismo matiz; el croma baja en los extremos para mantenerse en gama.
 * `dark` indica que el texto encima va en blanco: se elige el de mayor contraste, y uno de
 * los dos siempre supera 4,58:1 (AA).
 */
export function oklchScale(c: RGBA): { step: number; hex: string; dark: boolean }[] {
  const ok = rgbToOklch(c);
  return SCALE_L.map((L, i) => {
    const k = Math.min(1, 1.6 - Math.abs(L - 0.6) * 2.2);
    const [r, g, b] = oklchFit(L, ok.C * Math.max(0.25, k), ok.h);
    const tone = { r, g, b, a: 1 };
    return {
      step: SCALE_STEPS[i]!,
      hex: toHex(tone),
      dark: contrast(WHITE, tone) >= contrast(BLACK, tone),
    };
  });
}
