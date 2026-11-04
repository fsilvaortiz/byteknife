export { looksLikeUserAgent } from './detect';

export interface Named {
  name: string;
  version: string | null;
}

export type Device = 'desktop' | 'mobile' | 'tablet' | 'tv' | 'console' | 'bot';

export interface UserAgent {
  browser: Named | null;
  engine: Named | null;
  os: Named | null;
  device: Device;
  /** Nombre del bot o cliente automatizado, si lo es. */
  bot: string | null;
  /** El navegador congela partes del UA (Chrome reducido, macOS 10.15.7, Windows NT 10.0). */
  reduced: boolean;
}

const BOTS: [RegExp, string][] = [
  [/Googlebot/i, 'Googlebot'],
  [/bingbot/i, 'Bingbot'],
  [/DuckDuckBot/i, 'DuckDuckBot'],
  [/Baiduspider/i, 'Baiduspider'],
  [/YandexBot/i, 'YandexBot'],
  [/Applebot/i, 'Applebot'],
  [/GPTBot/i, 'GPTBot'],
  [/ClaudeBot/i, 'ClaudeBot'],
  [/PerplexityBot/i, 'PerplexityBot'],
  [/facebookexternalhit/i, 'Facebook'],
  [/Twitterbot/i, 'Twitterbot'],
  [/Slackbot/i, 'Slackbot'],
  [/Discordbot/i, 'Discordbot'],
  [/LinkedInBot/i, 'LinkedInBot'],
  [/AhrefsBot/i, 'AhrefsBot'],
  [/SemrushBot/i, 'SemrushBot'],
  [/Chrome-Lighthouse|Lighthouse/i, 'Lighthouse'],
  [/HeadlessChrome/i, 'Headless Chrome'],
  [/^curl\//i, 'curl'],
  [/^Wget\//i, 'Wget'],
  [/python-requests/i, 'python-requests'],
  [/PostmanRuntime/i, 'Postman'],
  [/^okhttp\//i, 'OkHttp'],
  [/Go-http-client/i, 'Go net/http'],
  [/axios\//i, 'axios'],
  [/bot|crawler|spider/i, 'Bot'],
];

const version = (ua: string, re: RegExp) => ua.match(re)?.[1]?.replace(/_/g, '.') ?? null;

function browserOf(ua: string): Named | null {
  const rules: [RegExp, string][] = [
    [/Edg(?:e|A|iOS)?\/([\d.]+)/, 'Edge'],
    [/OPR\/([\d.]+)/, 'Opera'],
    [/SamsungBrowser\/([\d.]+)/, 'Samsung Internet'],
    [/YaBrowser\/([\d.]+)/, 'Yandex Browser'],
    [/Vivaldi\/([\d.]+)/, 'Vivaldi'],
    [/(?:Firefox|FxiOS)\/([\d.]+)/, 'Firefox'],
    [/CriOS\/([\d.]+)/, 'Chrome'],
    [/HeadlessChrome\/([\d.]+)/, 'Chrome'],
    [/Chrome\/([\d.]+)/, 'Chrome'],
    [/Version\/([\d.]+).*Safari\//, 'Safari'],
    [/(?:MSIE |Trident\/.*rv:)([\d.]+)/, 'Internet Explorer'],
  ];
  for (const [re, name] of rules) {
    const v = version(ua, re);
    if (v) return { name, version: v };
  }
  return null;
}

function engineOf(ua: string, browser: Named | null): Named | null {
  if (/Trident\/([\d.]+)/.test(ua))
    return { name: 'Trident', version: version(ua, /Trident\/([\d.]+)/) };
  if (/(?:iPhone|iPad|iPod)/.test(ua))
    return { name: 'WebKit', version: version(ua, /AppleWebKit\/([\d.]+)/) };
  if (/Gecko\/\d/.test(ua) && /Firefox\//.test(ua))
    return { name: 'Gecko', version: version(ua, /rv:([\d.]+)/) };
  if (/Chrome\/|Chromium\//.test(ua) || (browser && ['Edge', 'Opera'].includes(browser.name)))
    return { name: 'Blink', version: version(ua, /Chrom(?:e|ium)\/([\d.]+)/) };
  if (/AppleWebKit\/([\d.]+)/.test(ua))
    return { name: 'WebKit', version: version(ua, /AppleWebKit\/([\d.]+)/) };
  return null;
}

const WINDOWS: Record<string, string> = {
  '10.0': '10 / 11',
  '6.3': '8.1',
  '6.2': '8',
  '6.1': '7',
  '6.0': 'Vista',
  '5.1': 'XP',
};

function osOf(ua: string): Named | null {
  const win = version(ua, /Windows NT ([\d.]+)/);
  if (win) return { name: 'Windows', version: WINDOWS[win] ?? win };
  const ios = version(ua, /(?:iPhone|CPU) OS ([\d_]+)/);
  if (ios) return { name: /iPad/.test(ua) ? 'iPadOS' : 'iOS', version: ios };
  const android = version(ua, /Android ([\d.]+)/);
  if (android || /Android/.test(ua)) return { name: 'Android', version: android };
  if (/CrOS/.test(ua)) return { name: 'ChromeOS', version: version(ua, /CrOS \S+ ([\d.]+)/) };
  const mac = version(ua, /Mac OS X ([\d_.]+)/);
  if (mac) return { name: 'macOS', version: mac };
  if (/Tizen/.test(ua)) return { name: 'Tizen', version: version(ua, /Tizen ([\d.]+)/) };
  if (/Web0S|webOS/.test(ua)) return { name: 'webOS', version: null };
  if (/Linux/.test(ua)) return { name: 'Linux', version: null };
  return null;
}

function deviceOf(ua: string): Device {
  if (/SmartTV|SMART-TV|Tizen|Web0S|BRAVIA|AppleTV|CrKey/i.test(ua)) return 'tv';
  if (/PlayStation|Xbox|Nintendo/i.test(ua)) return 'console';
  if (/iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) return 'tablet';
  if (/Mobi|iPhone|iPod|Android/.test(ua)) return 'mobile';
  return 'desktop';
}

export function parseUserAgent(input: string): UserAgent {
  const ua = input.trim().replace(/^user-agent:\s*/i, '');
  const bot = BOTS.find(([re]) => re.test(ua))?.[1] ?? null;
  const browser = browserOf(ua);
  const os = osOf(ua);
  return {
    browser,
    engine: engineOf(ua, browser),
    os,
    device: bot ? 'bot' : deviceOf(ua),
    bot,
    reduced:
      /Chrome\/\d+\.0\.0\.0/.test(ua) ||
      /Mac OS X 10_15_7/.test(ua) ||
      (os?.name === 'Windows' && /Windows NT 10\.0/.test(ua)) ||
      /Android 10; K\)/.test(ua),
  };
}

/** Versión principal, para mostrar «Chrome 131» en lugar de «131.0.6778.86». */
export const major = (v: string | null) => v?.split('.')[0] ?? null;
