import { toolPath } from '@byteknife/core/core/paths';
import { toolById } from '@byteknife/core/core/registry';
import { favorites, recents } from '@byteknife/core/core/store';
import { t, type Locale } from '@byteknife/core/i18n';
import { useMounted } from '@byteknife/core/ui/useMounted';

const MAX_SHOWN_RECENTS = 6;

export default function PersonalStrip({ locale }: { locale: Locale }) {
  const mounted = useMounted();
  if (!mounted) return null;

  const favs = favorites.value.map((id) => toolById.get(id)).filter((x) => x !== undefined);
  const recent = recents.value
    .filter((id) => !favorites.value.includes(id))
    .map((id) => toolById.get(id))
    .filter((x) => x !== undefined)
    .slice(0, MAX_SHOWN_RECENTS);
  if (!favs.length && !recent.length) return null;

  return (
    <section>
      {favs.length > 0 && (
        <>
          <div class="sec-h">
            <h2>{t(locale, 'home.favorites')}</h2>
          </div>
          <div class="strip" style="margin-bottom:18px" data-testid="favorites">
            {favs.map((tool) => (
              <a key={tool.id} class="chip" href={toolPath(locale, tool.id)}>
                ★ {tool.i18n[locale].name}
              </a>
            ))}
          </div>
        </>
      )}
      {recent.length > 0 && (
        <>
          <div class="sec-h">
            <h2>{t(locale, 'home.recent')}</h2>
          </div>
          <div class="strip" data-testid="recents">
            {recent.map((tool) => (
              <a key={tool.id} class="chip" href={toolPath(locale, tool.id)}>
                {tool.i18n[locale].name}
              </a>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
