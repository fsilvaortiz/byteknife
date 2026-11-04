import { useEffect } from 'preact/hooks';
import { favorites, recordVisit, toggleFavorite } from '@byteknife/core/core/store';
import { t, type Locale } from '@byteknife/core/i18n';
import { showToast } from '@byteknife/core/ui/toastStore';
import { useMounted } from '@byteknife/core/ui/useMounted';

export default function FavoriteButton({ locale, id }: { locale: Locale; id: string }) {
  const mounted = useMounted();
  useEffect(() => recordVisit(id), [id]);

  const isFav = mounted && favorites.value.includes(id);
  const onClick = () => {
    const on = toggleFavorite(id);
    showToast(t(locale, on ? 'tool.favAdded' : 'tool.favRemoved'));
  };

  return (
    <button class="fav" type="button" aria-pressed={isFav} onClick={onClick}>
      {t(locale, isFav ? 'tool.favorited' : 'tool.favorite')}
    </button>
  );
}
