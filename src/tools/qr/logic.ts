// Generador de QR con la librería qrcode (carga diferida). Todo se dibuja en el navegador:
// el texto no viaja a ningún servicio de QR.

export type Level = 'L' | 'M' | 'Q' | 'H';

export interface QrOptions {
  level: Level;
  /** Módulos de margen blanco alrededor (la norma pide 4). */
  margin: number;
  dark: string;
  light: string;
}

export interface QrResult {
  svg: string;
  version: number;
  size: number;
}

export class QrError extends Error {
  constructor(readonly code: 'empty' | 'tooLong') {
    super(code);
    this.name = 'QrError';
  }
}

const load = () => import('qrcode');

export async function makeQr(text: string, opts: QrOptions): Promise<QrResult> {
  if (!text) throw new QrError('empty');
  const QR = await load();
  let info;
  try {
    info = QR.create(text, { errorCorrectionLevel: opts.level });
  } catch {
    throw new QrError('tooLong');
  }
  const svg = await QR.toString(text, {
    type: 'svg',
    errorCorrectionLevel: opts.level,
    margin: opts.margin,
    color: { dark: opts.dark, light: opts.light },
  });
  return { svg, version: info.version, size: info.modules.size };
}

export async function makePng(text: string, opts: QrOptions, width = 1024): Promise<string> {
  const QR = await load();
  return QR.toDataURL(text, {
    errorCorrectionLevel: opts.level,
    margin: opts.margin,
    width,
    color: { dark: opts.dark, light: opts.light },
  });
}

export const svgDataUrl = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export type WifiSecurity = 'WPA' | 'WEP' | 'nopass';

/** Escapa \ ; , : y " como pide el formato WIFI: de ZXing. */
const wifiEscape = (s: string) => s.replace(/([\\;,:"])/g, '\\$1');

export function wifiPayload(
  ssid: string,
  password: string,
  security: WifiSecurity,
  hidden: boolean,
): string {
  const parts = [`T:${security}`, `S:${wifiEscape(ssid)}`];
  if (security !== 'nopass') parts.push(`P:${wifiEscape(password)}`);
  if (hidden) parts.push('H:true');
  return `WIFI:${parts.join(';')};;`;
}

/** Contraste aproximado entre dos colores #rrggbb (WCAG), para avisar si el QR no se leerá. */
export function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!;
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
}
