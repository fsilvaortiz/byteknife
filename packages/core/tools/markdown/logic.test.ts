import { describe, expect, it } from 'vitest';
import { renderMarkdown, safeHref, stats } from './logic';

const opts = { blockedImage: (alt: string) => `[imagen: ${alt}]` };
const render = (s: string) => renderMarkdown(s, opts);

describe('renderMarkdown', () => {
  it('Markdown con GFM: títulos, tablas, tareas y código', async () => {
    const html = await render(
      '# Hola\n\n| a | b |\n|:-:|--|\n| 1 | 2 |\n\n- [x] hecho\n\n```js\nlet x = 1;\n```',
    );
    expect(html).toContain('<h1>Hola</h1>');
    expect(html).toContain('<th align="center">a</th>');
    expect(html).toContain('<span class="md-task">☑</span> hecho');
    expect(html).not.toContain('<input');
    expect(html).toContain('<code class="language-js">let x = 1;\n</code>');
  });

  it('el HTML se muestra como texto', async () => {
    const html = await render('<script>alert(1)</script>\n\nhola <b onclick="x()">b</b>');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<b ');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('enlaces peligrosos pierden el href', async () => {
    expect(await render('[x](javascript:alert(1))')).toBe('<p>x</p>\n');
    expect(await render('[x](data:text/html,hola)')).toBe('<p>x</p>\n');
    expect(await render('[ok](https://x.dev "Título")')).toBe(
      '<p><a href="https://x.dev" title="Título" rel="noopener noreferrer nofollow">ok</a></p>\n',
    );
  });

  it('imágenes externas no se cargan; las data: sí', async () => {
    expect(await render('![logo](https://x.dev/a.png)')).toBe(
      '<p><span class="md-blocked">[imagen: logo]</span></p>\n',
    );
    expect(await render('![p](data:image/png;base64,AAAA "t")')).toBe(
      '<p><img src="data:image/png;base64,AAAA" alt="p" title="t"></p>\n',
    );
  });
});

describe('safeHref', () => {
  it.each([
    ['https://x.dev', 'https://x.dev'],
    ['mailto:a@b.dev', 'mailto:a@b.dev'],
    ['#seccion', '#seccion'],
    ['/docs', '/docs'],
    ['./a.md', './a.md'],
    ['otra-pagina', 'otra-pagina'],
    ['javascript:alert(1)', null],
    [' JavaScript:alert(1)', null],
    ['vbscript:x', null],
    ['data:text/html,x', null],
  ])('%s', (h, r) => {
    expect(safeHref(h)).toBe(r);
  });
});

describe('stats', () => {
  it('cuenta palabras sin código y títulos', () => {
    expect(
      stats('# Título\n\nUna frase con cinco palabras.\n\n```\nno cuenta nada aquí\n```\n## Otro'),
    ).toEqual({
      words: 7,
      headings: 2,
      minutes: 1,
    });
    expect(stats('palabra '.repeat(500)).minutes).toBe(3);
  });
});
