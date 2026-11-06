import { useEffect, useState } from 'preact/hooks';
import CommandPalette from '@byteknife/core/shell/CommandPalette';
import Toast from '@byteknife/core/ui/Toast';
import { pickLocale } from '@byteknife/core/core/locale';
import { local, read, write } from '@byteknife/core/core/storage';
import { tools } from '@byteknife/core/core/registry';
import Header from './Header';
import Home from './Home';
import ToolPage from './ToolPage';
import Updater from './Updater';
import { parseRoute, type Route } from './route';

const current = (): Route =>
  parseRoute(location.hash, pickLocale(read(local, 'locale', null), navigator.languages));

export default function App() {
  const [route, setRoute] = useState(current);

  useEffect(() => {
    const onHash = () => setRoute(current());
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    document.documentElement.lang = route.locale;
    write(local, 'locale', route.locale);
  }, [route.locale]);

  useEffect(() => scrollTo(0, 0), [route.id]);

  const { locale } = route;
  const tool = route.id ? tools.find((x) => x.id === route.id) : undefined;
  return (
    // key: al cambiar de idioma, todo se monta de nuevo con los textos nuevos.
    <div key={locale}>
      <Header locale={locale} path={tool ? `${tool.id}/` : ''} />
      <main id="app">
        {tool ? <ToolPage key={tool.id} locale={locale} tool={tool} /> : <Home locale={locale} />}
      </main>
      <CommandPalette locale={locale} />
      <Toast />
      <Updater locale={locale} />
    </div>
  );
}
