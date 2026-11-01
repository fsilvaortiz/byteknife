import type { Tokens } from 'marked';

// Vista previa de Markdown con marked (carga diferida). El HTML del usuario no se ejecuta:
// los bloques HTML se muestran como texto, los enlaces solo admiten http(s), mailto,
// anclas y rutas relativas, y las imágenes externas no se cargan (la CSP solo permite
// img-src 'self' data:, y así ninguna URL pegada genera una petición).

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** URL de enlace segura: http(s), mailto, ancla o relativa; nunca javascript:, data: ni vbscript:. */
export function safeHref(href: string): string | null {
  const h = href.trim();
  if (/^(?:https?:|mailto:)/i.test(h) || /^[#/.?]/.test(h)) return h;
  if (/^[a-z][\w+.-]*:/i.test(h)) return null;
  return h;
}

export interface RenderOptions {
  /** Texto en lugar de una imagen externa que no se carga; recibe el texto alternativo. */
  blockedImage: (alt: string) => string;
}

export async function renderMarkdown(src: string, opts: RenderOptions): Promise<string> {
  const { Marked } = await import('marked');
  const md = new Marked({ gfm: true });
  md.use({
    renderer: {
      html({ text }: Tokens.HTML | Tokens.Tag) {
        return esc(text);
      },
      link(
        this: { parser: { parseInline: (t: Tokens.Generic[]) => string } },
        { href, title, tokens }: Tokens.Link,
      ) {
        const label = this.parser.parseInline(tokens);
        const url = safeHref(href);
        if (!url) return label;
        const t = title ? ` title="${esc(title)}"` : '';
        return `<a href="${esc(url)}"${t} rel="noopener noreferrer nofollow">${label}</a>`;
      },
      // Las casillas de tareas se muestran como ☑/☐: un <input> deshabilitado sin etiqueta
      // no aporta nada y falla la revisión de accesibilidad.
      checkbox({ checked }: Tokens.Checkbox) {
        return `<span class="md-task">${checked ? '☑' : '☐'}</span> `;
      },
      image({ href, title, text }: Tokens.Image) {
        if (/^data:image\/(?:png|gif|jpe?g|webp|avif);/i.test(href)) {
          const t = title ? ` title="${esc(title)}"` : '';
          return `<img src="${esc(href)}" alt="${esc(text)}"${t}>`;
        }
        return `<span class="md-blocked">${esc(opts.blockedImage(text))}</span>`;
      },
    },
  });
  return md.parse(src, { async: false }) as string;
}

export interface Stats {
  words: number;
  headings: number;
  /** Minutos de lectura a 220 palabras por minuto, redondeado hacia arriba. */
  minutes: number;
}

export function stats(src: string): Stats {
  const text = src.replace(/```[\s\S]*?```/g, ' ').replace(/[#>*_`[\]()!|-]/g, ' ');
  const words = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  return {
    words,
    headings: (src.match(/^#{1,6}\s/gm) ?? []).length,
    minutes: Math.max(1, Math.ceil(words / 220)),
  };
}
