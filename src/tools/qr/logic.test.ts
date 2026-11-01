import { describe, expect, it } from 'vitest';
import {
  contrast,
  makePng,
  makeQr,
  QrError,
  svgDataUrl,
  wifiPayload,
  type QrOptions,
} from './logic';

const opts: QrOptions = { level: 'M', margin: 4, dark: '#000000', light: '#ffffff' };

describe('makeQr', () => {
  it('genera SVG con versión y tamaño', async () => {
    const r = await makeQr('https://byteknife.dev', opts);
    expect(r.svg).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 33 33"/);
    expect(r.svg).not.toMatch(/style=/);
    expect(r.version).toBe(2);
    expect(r.size).toBe(25);
  });

  it('más corrección de errores agranda el código', async () => {
    const low = await makeQr('https://byteknife.dev/es/json/', { ...opts, level: 'L' });
    const high = await makeQr('https://byteknife.dev/es/json/', { ...opts, level: 'H' });
    expect(high.version).toBeGreaterThan(low.version);
  });

  it('errores: vacío y demasiado largo', async () => {
    await expect(makeQr('', opts)).rejects.toMatchObject({ code: 'empty' });
    await expect(makeQr('x'.repeat(5000), opts)).rejects.toBeInstanceOf(QrError);
  });

  it('PNG y data URL de SVG', async () => {
    expect(await makePng('hola', opts, 64)).toMatch(/^data:image\/png;base64,/);
    expect(svgDataUrl('<svg/>')).toBe('data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E');
  });
});

describe('wifiPayload', () => {
  it('escapa caracteres especiales', () => {
    expect(wifiPayload('Casa;5G', 'p@ss:"1"', 'WPA', false)).toBe(
      String.raw`WIFI:T:WPA;S:Casa\;5G;P:p@ss\:\"1\";;`,
    );
  });
  it('escapa la barra invertida', () => {
    expect(wifiPayload(String.raw`a\b`, '', 'nopass', false)).toBe(
      String.raw`WIFI:T:nopass;S:a\\b;;`,
    );
  });

  it('sin clave y red oculta', () => {
    expect(wifiPayload('Invitados', 'ignorada', 'nopass', true)).toBe(
      'WIFI:T:nopass;S:Invitados;H:true;;',
    );
  });
});

describe('contrast', () => {
  it('negro sobre blanco es 21', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 0);
    expect(contrast('#ffffff', '#000000')).toBeCloseTo(21, 0);
    expect(contrast('#777777', '#888888')).toBeLessThan(1.5);
  });
});
