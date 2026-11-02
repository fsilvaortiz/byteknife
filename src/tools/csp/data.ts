import type { Locale } from '../../i18n';

type Text = Record<Locale, string>;
const d = (es: string, en: string, pt: string): Text => ({ es, en, pt });

/** Directivas de CSP nivel 3 con su descripción. */
export const DIRECTIVES: Record<string, Text> = {
  'default-src': d(
    'Valor por defecto para las directivas -src que no se declaran.',
    'Fallback for the -src directives that are not declared.',
    'Valor padrão para as diretivas -src não declaradas.',
  ),
  'script-src': d(
    'Orígenes de JavaScript: archivos, en línea y eval.',
    'Sources for JavaScript: files, inline and eval.',
    'Origens de JavaScript: arquivos, inline e eval.',
  ),
  'script-src-elem': d(
    'Orígenes de elementos <script>.',
    'Sources for <script> elements.',
    'Origens de elementos <script>.',
  ),
  'script-src-attr': d(
    'Manejadores en línea como onclick.',
    'Inline event handlers such as onclick.',
    'Manipuladores inline como onclick.',
  ),
  'style-src': d(
    'Orígenes de CSS: hojas, <style> y atributos style.',
    'Sources for CSS: stylesheets, <style> and style attributes.',
    'Origens de CSS: folhas, <style> e atributos style.',
  ),
  'style-src-elem': d(
    'Orígenes de <style> y <link rel=stylesheet>.',
    'Sources for <style> and <link rel=stylesheet>.',
    'Origens de <style> e <link rel=stylesheet>.',
  ),
  'style-src-attr': d(
    'Atributos style en línea.',
    'Inline style attributes.',
    'Atributos style inline.',
  ),
  'img-src': d(
    'Orígenes de imágenes y favicons.',
    'Sources for images and favicons.',
    'Origens de imagens e favicons.',
  ),
  'font-src': d(
    'Orígenes de fuentes (@font-face).',
    'Sources for fonts (@font-face).',
    'Origens de fontes (@font-face).',
  ),
  'connect-src': d(
    'Destinos de fetch, XHR, WebSocket y EventSource.',
    'Targets for fetch, XHR, WebSocket and EventSource.',
    'Destinos de fetch, XHR, WebSocket e EventSource.',
  ),
  'media-src': d(
    'Orígenes de audio y video.',
    'Sources for audio and video.',
    'Origens de áudio e vídeo.',
  ),
  'object-src': d(
    'Orígenes de <object> y <embed> (plugins).',
    'Sources for <object> and <embed> (plugins).',
    'Origens de <object> e <embed> (plugins).',
  ),
  'frame-src': d(
    'Orígenes que se pueden cargar en iframes.',
    'Sources that can be loaded in iframes.',
    'Origens que podem ser carregadas em iframes.',
  ),
  'child-src': d(
    'Iframes y workers (antiguo; mejor frame-src y worker-src).',
    'Iframes and workers (legacy; prefer frame-src and worker-src).',
    'Iframes e workers (antigo; prefira frame-src e worker-src).',
  ),
  'worker-src': d(
    'Orígenes de Web Workers y service workers.',
    'Sources for Web Workers and service workers.',
    'Origens de Web Workers e service workers.',
  ),
  'manifest-src': d(
    'Orígenes del manifiesto de la app.',
    'Sources for the app manifest.',
    'Origens do manifesto do app.',
  ),
  'frame-ancestors': d(
    'Quién puede incrustar esta página (anti clickjacking).',
    'Who may embed this page (anti-clickjacking).',
    'Quem pode incorporar esta página (anticlickjacking).',
  ),
  'base-uri': d(
    'URLs permitidas en <base href>.',
    'URLs allowed in <base href>.',
    'URLs permitidas em <base href>.',
  ),
  'form-action': d(
    'Destinos permitidos para enviar formularios.',
    'Allowed targets for form submissions.',
    'Destinos permitidos para enviar formulários.',
  ),
  'upgrade-insecure-requests': d(
    'Pide por HTTPS los recursos con http://.',
    'Requests http:// resources over HTTPS.',
    'Pede via HTTPS os recursos com http://.',
  ),
  sandbox: d(
    'Aplica restricciones de iframe sandbox a la página.',
    'Applies iframe sandbox restrictions to the page.',
    'Aplica restrições de iframe sandbox à página.',
  ),
  'report-uri': d(
    'URL donde se envían los reportes de violación (antiguo).',
    'URL where violation reports are sent (legacy).',
    'URL para onde vão os relatórios de violação (antigo).',
  ),
  'report-to': d(
    'Grupo de Reporting-Endpoints para los reportes.',
    'Reporting-Endpoints group for reports.',
    'Grupo de Reporting-Endpoints para os relatórios.',
  ),
  'require-trusted-types-for': d(
    'Exige Trusted Types para sumideros DOM como innerHTML.',
    'Requires Trusted Types for DOM sinks such as innerHTML.',
    'Exige Trusted Types para sinks do DOM como innerHTML.',
  ),
  'trusted-types': d(
    'Políticas de Trusted Types permitidas.',
    'Allowed Trusted Types policies.',
    'Políticas de Trusted Types permitidas.',
  ),
};

/** Directivas obsoletas: los navegadores las ignoran. */
export const DEPRECATED = new Set([
  'block-all-mixed-content',
  'plugin-types',
  'prefetch-src',
  'referrer',
  'reflected-xss',
  'navigate-to',
]);

/** Directivas -src que heredan de default-src. */
export const FETCH_DIRECTIVES = [
  'script-src',
  'style-src',
  'img-src',
  'font-src',
  'connect-src',
  'media-src',
  'object-src',
  'frame-src',
  'worker-src',
  'manifest-src',
  'child-src',
];
