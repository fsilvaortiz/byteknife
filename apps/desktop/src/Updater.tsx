import { useEffect, useState } from 'preact/hooks';
import { isTauri } from '@tauri-apps/api/core';
import type { Update } from '@tauri-apps/plugin-updater';
import { t, type Locale } from '@byteknife/core/i18n';

type State =
  | { kind: 'idle' }
  | { kind: 'available'; update: Update }
  | { kind: 'installing' }
  | { kind: 'failed' };

/**
 * Al abrir, pregunta a GitHub Releases si hay una versión nueva (es lo único que la app
 * consulta por su cuenta). Si la hay, ofrece instalarla; nunca se instala sola.
 */
export default function Updater({ locale }: { locale: Locale }) {
  const [state, setState] = useState<State>({ kind: 'idle' });

  useEffect(() => {
    if (!isTauri()) return;
    import('@tauri-apps/plugin-updater')
      .then(({ check }) => check())
      .then((update) => update && setState({ kind: 'available', update }))
      // Sin conexión o sin releases: la app sigue igual, sin avisar.
      .catch(() => {});
  }, []);

  if (state.kind === 'idle') return null;

  const install = async (update: Update) => {
    setState({ kind: 'installing' });
    try {
      await update.downloadAndInstall();
      const { relaunch } = await import('@tauri-apps/plugin-process');
      await relaunch();
    } catch {
      setState({ kind: 'failed' });
    }
  };

  return (
    <div class="update-bar" role="status">
      {state.kind === 'available' && (
        <>
          <span>{t(locale, 'update.available', { version: state.update.version })}</span>
          <button class="btn sm primary" type="button" onClick={() => install(state.update)}>
            {t(locale, 'update.install')}
          </button>
          <button class="btn sm" type="button" onClick={() => setState({ kind: 'idle' })}>
            {t(locale, 'update.later')}
          </button>
        </>
      )}
      {state.kind === 'installing' && <span>{t(locale, 'update.installing')}</span>}
      {state.kind === 'failed' && (
        <>
          <span>{t(locale, 'update.failed')}</span>
          <button class="btn sm" type="button" onClick={() => setState({ kind: 'idle' })}>
            {t(locale, 'update.later')}
          </button>
        </>
      )}
    </div>
  );
}
