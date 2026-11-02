import { t, type Locale } from '../i18n';
import { copyText } from './clipboard';
import { showToast } from './toastStore';

export interface ScaleStep {
  step: number;
  hex: string;
  /** true = fondo oscuro, texto claro. */
  dark: boolean;
}

/** Escala de tonos; cada botón copia su HEX. */
export default function ColorScale({ locale, steps }: { locale: Locale; steps: ScaleStep[] }) {
  const copy = async (hex: string) =>
    showToast(t(locale, (await copyText(hex)) ? 'copy.done' : 'copy.failed'));
  return (
    <div class="scale">
      {steps.map((s) => (
        <button
          key={s.step}
          type="button"
          title={s.hex}
          aria-label={`${s.step} ${s.hex}`}
          style={{ background: s.hex, color: s.dark ? '#fff' : '#000' }}
          onClick={() => copy(s.hex)}
        >
          <span>{s.step}</span>
          <span>{s.hex}</span>
        </button>
      ))}
    </div>
  );
}
