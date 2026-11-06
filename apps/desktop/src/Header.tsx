import { homePath } from '@byteknife/core/core/paths';
import SearchButton from '@byteknife/core/shell/SearchButton';
import { locales, t, type Locale } from '@byteknife/core/i18n';

/** La misma cabecera que la web (Base.astro): logo, búsqueda e idiomas. */
export default function Header({ locale, path }: { locale: Locale; path: string }) {
  return (
    <header class="top">
      <div class="top-in">
        <a class="logo" href={homePath(locale)} aria-label={t(locale, 'logo.aria')}>
          byteknife<span class="cur" aria-hidden="true"></span>
        </a>
        <SearchButton locale={locale} />
        <nav class="langs" aria-label={t(locale, 'lang.nav')}>
          {locales.map((l) => (
            <a
              key={l}
              href={`${homePath(l)}${path}`}
              hreflang={l}
              lang={l}
              title={t(l, 'lang.name')}
              aria-current={l === locale ? 'true' : undefined}
            >
              {l.toUpperCase()}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
