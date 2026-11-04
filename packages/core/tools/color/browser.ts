import type { RGBA } from './logic';

let canvas: HTMLCanvasElement | undefined;

/**
 * Respaldo para lo que el parser puro no cubre (colores con nombre, lab(), hwb(), color()…):
 * el navegador lo valida y lo pinta en un canvas de 1 × 1 para leer el sRGB resultante.
 */
export function cssColorToRgba(input: string): RGBA | null {
  const s = input.trim();
  if (!s || typeof CSS === 'undefined' || !CSS.supports('color', s)) return null;
  canvas ??= document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = '#000';
  ctx.fillStyle = s;
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 255] = ctx.getImageData(0, 0, 1, 1).data;
  return { r, g, b, a: Math.round((a / 255) * 1000) / 1000 };
}
