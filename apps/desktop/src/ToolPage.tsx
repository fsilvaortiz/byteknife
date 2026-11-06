import { Fragment } from 'preact';
import { toolPath } from '@byteknife/core/core/paths';
import { toolsIn } from '@byteknife/core/core/registry';
import { categories, type ToolMeta } from '@byteknife/core/core/types';
import FavoriteButton from '@byteknife/core/shell/FavoriteButton';
import ToolHost from '@byteknife/core/shell/ToolHost';
import { t, type Locale } from '@byteknife/core/i18n';

/** La página de una herramienta de la web ([tool].astro), sin la sección de SEO. */
export default function ToolPage({ locale, tool }: { locale: Locale; tool: ToolMeta }) {
  const text = tool.i18n[locale];
  return (
    <div class="wrap work">
      <nav class="rail" aria-label={t(locale, 'tool.rail')}>
        {categories.map((c) => (
          // Fragment: h4 y links quedan hermanos, como en la web (.rail h4:first-child).
          <Fragment key={c}>
            <h4>{t(locale, `cat.${c}`)}</h4>
            {toolsIn(c).map((x) => (
              <a
                key={x.id}
                href={toolPath(locale, x.id)}
                aria-current={x.id === tool.id ? 'page' : undefined}
              >
                {x.i18n[locale].name}
              </a>
            ))}
          </Fragment>
        ))}
      </nav>
      <div class="work-main">
        <header class="tool-head">
          <div>
            <p class="eyebrow">{t(locale, `cat.${tool.category}`)}</p>
            <h1>{text.name}</h1>
            <p class="lede">{text.description}</p>
          </div>
          <FavoriteButton locale={locale} id={tool.id} />
        </header>
        <div class="tool" id="toolRoot" data-tool-id={tool.id}>
          <ToolHost locale={locale} id={tool.id} />
        </div>
      </div>
    </div>
  );
}
