import { toolPath } from '@byteknife/core/core/paths';
import { tools, toolsIn } from '@byteknife/core/core/registry';
import { favorites } from '@byteknife/core/core/store';
import { categories } from '@byteknife/core/core/types';
import NowStrip from '@byteknife/core/shell/NowStrip';
import PasteBox from '@byteknife/core/shell/PasteBox';
import PersonalStrip from '@byteknife/core/shell/PersonalStrip';
import { t, type Locale } from '@byteknife/core/i18n';

/** El inicio de la web ([locale]/index.astro) sin la parte de SEO ni los links externos. */
export default function Home({ locale }: { locale: Locale }) {
  const favs = favorites.value;
  return (
    <div class="wrap home">
      <section class="hero">
        <div>
          <h1>
            {t(locale, 'home.heroBefore')} <mark>{t(locale, 'home.heroMark')}</mark>
            {t(locale, 'home.heroAfter')}
          </h1>
          <p>{t(locale, 'desktop.lede')}</p>
        </div>
        <PasteBox locale={locale} />
      </section>

      <NowStrip locale={locale} />

      <PersonalStrip locale={locale} />

      <section>
        <div class="sec-h">
          <h2>{t(locale, 'home.allTools')}</h2>
          <small>
            {t(locale, 'home.toolCount', { count: tools.length })} <kbd data-kbd-mod>⌘ K</kbd>{' '}
            {t(locale, 'home.jumpHint')}
          </small>
        </div>
        <div class="catalog">
          {categories.map((c) => (
            <div class="cat" key={c}>
              <h3>{t(locale, `cat.${c}`)}</h3>
              <ul>
                {toolsIn(c).map((tool) => (
                  <li key={tool.id}>
                    <a class="tlink" href={toolPath(locale, tool.id)} data-tool={tool.id}>
                      <b>{tool.i18n[locale].name}</b>
                      <i hidden={!favs.includes(tool.id)} aria-hidden="true">
                        ★
                      </i>
                      <span>{tool.i18n[locale].description}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer class="foot">
        <span>{t(locale, 'desktop.footerPrivacy')}</span>
        <span>{t(locale, 'desktop.footerStorage')}</span>
      </footer>
    </div>
  );
}
