import { t, type Locale } from '../i18n';
import { copyText } from './clipboard';
import { showToast } from './toastStore';

interface Props {
  locale: Locale;
  /** Texto a copiar, o función que lo devuelve al momento del clic. */
  text: string | (() => string);
  class?: string;
}

export default function CopyButton({ locale, text, class: className = 'ghost' }: Props) {
  const onClick = async () => {
    const value = typeof text === 'function' ? text() : text;
    const ok = await copyText(value);
    showToast(t(locale, ok ? 'copy.done' : 'copy.failed'));
  };
  return (
    <button class={className} type="button" onClick={onClick}>
      {t(locale, 'copy.button')}
    </button>
  );
}
