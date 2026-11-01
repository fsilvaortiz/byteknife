import { describe, expect, it } from 'vitest';
import { looksLikeUserAgent, major, parseUserAgent } from './logic';

const UA = {
  chromeWin:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.2903.70',
  firefoxMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.6; rv:132.0) Gecko/20100101 Firefox/132.0',
  safariMac:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  iphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
  chromeIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1',
  ipad: 'Mozilla/5.0 (iPad; CPU OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',
  android:
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  samsungTab:
    'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Safari/537.36',
  opera:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 OPR/115.0.0.0',
  ie11: 'Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko',
  chromeos:
    'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  googlebot:
    'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.69 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  curl: 'curl/8.7.1',
  tv: 'Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/4.0 Chrome/76.0.3809.146 TV Safari/537.36',
  ps5: 'Mozilla/5.0 (PlayStation; PlayStation 5/2.26) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15',
  webos:
    'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36',
  xp: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)',
  unknown: 'MiCliente/1.0',
};

const summary = (ua: string) => {
  const r = parseUserAgent(ua);
  return [
    r.browser && `${r.browser.name} ${major(r.browser.version)}`,
    r.engine?.name,
    r.os && `${r.os.name}${r.os.version ? ` ${r.os.version}` : ''}`,
    r.device,
    r.bot,
  ];
};

describe('parseUserAgent', () => {
  it.each([
    ['chromeWin', ['Chrome 131', 'Blink', 'Windows 10 / 11', 'desktop', null]],
    ['edge', ['Edge 131', 'Blink', 'Windows 10 / 11', 'desktop', null]],
    ['firefoxMac', ['Firefox 132', 'Gecko', 'macOS 14.6', 'desktop', null]],
    ['safariMac', ['Safari 18', 'WebKit', 'macOS 10.15.7', 'desktop', null]],
    ['iphone', ['Safari 18', 'WebKit', 'iOS 18.1', 'mobile', null]],
    ['chromeIos', ['Chrome 131', 'WebKit', 'iOS 18.1', 'mobile', null]],
    ['ipad', ['Safari 17', 'WebKit', 'iPadOS 17.6', 'tablet', null]],
    ['android', ['Chrome 131', 'Blink', 'Android 10', 'mobile', null]],
    ['samsungTab', ['Samsung Internet 26', 'Blink', 'Android 14', 'tablet', null]],
    ['opera', ['Opera 115', 'Blink', 'Linux', 'desktop', null]],
    ['ie11', ['Internet Explorer 11', 'Trident', 'Windows 7', 'desktop', null]],
    ['chromeos', ['Chrome 131', 'Blink', 'ChromeOS 14541.0.0', 'desktop', null]],
    ['googlebot', ['Chrome 131', 'Blink', 'Android 6.0.1', 'bot', 'Googlebot']],
    ['curl', [null, undefined, null, 'bot', 'curl']],
    ['tv', ['Samsung Internet 4', 'Blink', 'Tizen 6.0', 'tv', null]],
    ['ps5', ['Safari 13', 'WebKit', null, 'console', null]],
    ['webos', ['Chrome 79', 'Blink', 'webOS', 'tv', null]],
    ['xp', ['Internet Explorer 8', 'Trident', 'Windows XP', 'desktop', null]],
    ['unknown', [null, undefined, null, 'desktop', null]],
  ] as const)('%s', (key, expected) => {
    expect(summary(UA[key])).toEqual(expected);
  });

  it('UA reducido y prefijo de cabecera', () => {
    expect(parseUserAgent(`User-Agent: ${UA.chromeWin}`).reduced).toBe(true);
    expect(parseUserAgent(UA.firefoxMac).reduced).toBe(false);
    expect(parseUserAgent(UA.safariMac).reduced).toBe(true);
  });

  it('versiones desconocidas de Windows quedan tal cual', () => {
    expect(parseUserAgent('Mozilla/5.0 (Windows NT 11.5) Firefox/1.0').os).toEqual({
      name: 'Windows',
      version: '11.5',
    });
    expect(parseUserAgent('Mozilla/5.0 (Linux; Android; K) Chrome/1.0').os).toEqual({
      name: 'Android',
      version: null,
    });
  });

  it('major', () => {
    expect(major('131.0.6778.86')).toBe('131');
    expect(major(null)).toBeNull();
  });
});

describe('looksLikeUserAgent', () => {
  it.each([UA.chromeWin, UA.curl, `User-Agent: ${UA.iphone}`])('sí', (s) => {
    expect(looksLikeUserAgent(s)).toBe(true);
  });
  it.each(['Mozilla', 'hola', 'curl https://x'])('no: %s', (s) => {
    expect(looksLikeUserAgent(s)).toBe(false);
  });
});
