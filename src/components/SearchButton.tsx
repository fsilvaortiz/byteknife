import { useEffect, useState } from 'preact/hooks';
import { t, type Locale } from '../i18n';
import { openPalette } from './paletteState';

export default function SearchButton({ locale }: { locale: Locale }) {
  const [modLabel, setModLabel] = useState('Ctrl K');

  useEffect(() => {
    const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    const label = mac ? '⌘ K' : 'Ctrl K';
    setModLabel(label);
    document.querySelectorAll('[data-kbd-mod]').forEach((el) => (el.textContent = label));
  }, []);

  return (
    <button class="search-btn" type="button" onClick={openPalette}>
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <span>{t(locale, 'search.button')}</span>
      <kbd>{modLabel}</kbd>
    </button>
  );
}
