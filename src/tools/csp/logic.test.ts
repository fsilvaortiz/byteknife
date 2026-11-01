import { describe, expect, it } from 'vitest';
import { analyze, DIRECTIVES, effective, looksLikeCsp, parsePolicy, serialize } from './logic';

const keys = (s: string) => analyze(parsePolicy(s)).map((f) => `${f.level}:${f.key}`);

describe('parsePolicy', () => {
  it('con prefijo, mayúsculas y duplicados', () => {
    const p = parsePolicy(
      "Content-Security-Policy: Default-Src 'self'; img-src * data:;; img-src 'none'",
    );
    expect(p).toEqual({
      directives: [
        { name: 'default-src', sources: ["'self'"] },
        { name: 'img-src', sources: ['*', 'data:'] },
      ],
      reportOnly: false,
      duplicates: ['img-src'],
    });
  });

  it('report-only y meta', () => {
    expect(parsePolicy("Content-Security-Policy-Report-Only: default-src 'self'").reportOnly).toBe(
      true,
    );
    expect(
      parsePolicy(`<meta http-equiv="Content-Security-Policy" content="script-src 'self'">`)
        .directives,
    ).toEqual([{ name: 'script-src', sources: ["'self'"] }]);
  });

  it('serialize', () => {
    expect(serialize(parsePolicy("default-src 'self' ;  object-src 'none'"))).toBe(
      "default-src 'self'; object-src 'none'",
    );
  });
});

describe('effective', () => {
  const p = parsePolicy("default-src 'self'; script-src 'nonce-a'");
  it('hereda de default-src y de script-src', () => {
    expect(effective(p, 'img-src')).toEqual(["'self'"]);
    expect(effective(p, 'script-src-elem')).toEqual(["'nonce-a'"]);
    expect(effective(p, 'style-src-attr')).toEqual(["'self'"]);
    expect(effective(p, 'frame-ancestors')).toBeNull();
    expect(effective(parsePolicy('img-src *'), 'script-src')).toBeNull();
  });
});

describe('analyze', () => {
  it('una política estricta', () => {
    expect(
      keys(
        "default-src 'self'; script-src 'nonce-r4nd0m' 'strict-dynamic'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; report-to csp",
      ),
    ).toEqual(['ok:strictDynamic', 'ok:nonce']);
  });

  it('una política débil', () => {
    expect(
      keys(
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http://cdn.x.dev; foo-src x; block-all-mixed-content",
      ),
    ).toEqual([
      'bad:unsafeInline',
      'bad:unsafeEval',
      'bad:scriptWildcard',
      'warn:objectSrc',
      'warn:baseUri',
      'warn:frameAncestors',
      'info:formAction',
      'warn:httpSource',
      'warn:unknown',
      'info:deprecated',
      'info:noReports',
    ]);
  });

  it('unsafe-inline con hash se ignora; sin script-src ni default-src es grave', () => {
    expect(keys("script-src 'unsafe-inline' 'sha256-abc'; object-src 'none'")).toContain(
      'info:inlineIgnored',
    );
    expect(keys('img-src *')).toContain('bad:noScript');
  });

  it('report-only y duplicados', () => {
    const k = keys("Content-Security-Policy-Report-Only: default-src 'self'; default-src *");
    expect(k.slice(0, 2)).toEqual(['warn:reportOnly', 'warn:duplicate']);
  });

  it('vacía no da hallazgos', () => {
    expect(keys('')).toEqual([]);
  });
});

describe('datos y detección', () => {
  it('las directivas tienen texto en los tres idiomas', () => {
    for (const t of Object.values(DIRECTIVES))
      for (const l of ['es', 'en', 'pt'] as const) expect(t[l]).not.toBe('');
  });

  it.each([
    ["default-src 'self'", true],
    ['Content-Security-Policy: x', true],
    ["frame-ancestors 'none'", false],
    ['hola', false],
  ])('looksLikeCsp(%j) = %s', (s, r) => {
    expect(looksLikeCsp(s)).toBe(r);
  });
});
